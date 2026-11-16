import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getServerEnvironment } from "@/env";

import type { PaymentGateway, PaymentOrder, PaymentOrderRequest } from "./types";

const razorpayOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.literal("INR"),
  status: z.literal("created"),
});

export class PaymentConfigurationError extends Error {
  constructor() {
    super("Razorpay Test Mode is not configured.");
    this.name = "PaymentConfigurationError";
  }
}

type Fetcher = typeof fetch;

export class RazorpayGateway implements PaymentGateway {
  constructor(
    private readonly keyId: string,
    private readonly keySecret: string,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async createOrder(request: PaymentOrderRequest): Promise<PaymentOrder> {
    const response = await this.fetcher("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(request.amountPaise),
        currency: request.currency,
        receipt: request.receipt,
        notes: request.notes,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Razorpay order creation failed with status ${response.status}.`);
    }

    const order = razorpayOrderSchema.parse(await response.json());
    if (BigInt(order.amount) !== request.amountPaise) {
      throw new Error("Razorpay returned an unexpected order amount.");
    }

    return {
      id: order.id,
      amountPaise: BigInt(order.amount),
      currency: order.currency,
      status: order.status,
    };
  }
}

export function getRazorpayGateway(): Readonly<{
  gateway: PaymentGateway;
  publicKeyId: string;
}> {
  const environment = getServerEnvironment();
  if (!environment.RAZORPAY_KEY_ID || !environment.RAZORPAY_KEY_SECRET) {
    throw new PaymentConfigurationError();
  }

  return {
    gateway: new RazorpayGateway(environment.RAZORPAY_KEY_ID, environment.RAZORPAY_KEY_SECRET),
    publicKeyId: environment.RAZORPAY_KEY_ID,
  };
}

export function isValidRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getServerEnvironment().RAZORPAY_WEBHOOK_SECRET;
  return secret ? isValidRazorpaySignature(rawBody, signature, secret) : false;
}
