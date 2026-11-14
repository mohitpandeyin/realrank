import { AdminResourcePage } from "@/components/ui/AdminResourcePage";

export default async function AdminPaymentPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminResourcePage resource="Payment" recordId={id} />;
}
