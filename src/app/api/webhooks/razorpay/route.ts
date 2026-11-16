import { processRazorpayWebhook } from "@/server/payments/razorpay-webhook";
import { verifyRazorpayWebhookSignature } from "@/server/payments/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return Response.json({ received: false }, { status: 401 });
  }
  if (!eventId) {
    return Response.json({ received: false }, { status: 400 });
  }

  try {
    const payload: unknown = JSON.parse(rawBody);
    await processRazorpayWebhook(eventId, payload);
    return Response.json({ received: true });
  } catch {
    return Response.json({ received: false }, { status: 500 });
  }
}
