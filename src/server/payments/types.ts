export type PaymentOrderRequest = Readonly<{
  amountPaise: bigint;
  currency: "INR";
  receipt: string;
  notes: Readonly<Record<string, string>>;
}>;

export type PaymentOrder = Readonly<{
  id: string;
  amountPaise: bigint;
  currency: "INR";
  status: "created";
}>;

export interface PaymentGateway {
  createOrder(request: PaymentOrderRequest): Promise<PaymentOrder>;
}
