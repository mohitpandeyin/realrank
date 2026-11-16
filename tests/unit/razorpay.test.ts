import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { isValidRazorpaySignature, RazorpayGateway } from "../../src/server/payments/razorpay";

describe("Razorpay order adapter", () => {
  it("uses server credentials and sends paise to the Orders API", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "order_test_123",
          amount: 15100,
          currency: "INR",
          status: "created",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const gateway = new RazorpayGateway("rzp_test_public", "server-secret", fetcher);

    await expect(
      gateway.createOrder({
        amountPaise: 15_100n,
        currency: "INR",
        receipt: "rr_test_receipt",
        notes: { checkout_id: "checkout-id" },
      }),
    ).resolves.toEqual({
      id: "order_test_123",
      amountPaise: 15_100n,
      currency: "INR",
      status: "created",
    });

    expect(fetcher).toHaveBeenCalledOnce();
    const [, request] = fetcher.mock.calls[0] ?? [];
    expect(new Headers(request?.headers).get("Authorization")).toBe(
      `Basic ${Buffer.from("rzp_test_public:server-secret").toString("base64")}`,
    );
    expect(request?.body).toContain('"amount":15100');
  });
});

describe("Razorpay webhook signature", () => {
  it("accepts the raw-body HMAC and rejects a changed body", () => {
    const rawBody = '{"event":"payment.captured"}';
    const secret = "separate-webhook-secret";
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

    expect(isValidRazorpaySignature(rawBody, signature, secret)).toBe(true);
    expect(isValidRazorpaySignature(`${rawBody} `, signature, secret)).toBe(false);
  });
});
