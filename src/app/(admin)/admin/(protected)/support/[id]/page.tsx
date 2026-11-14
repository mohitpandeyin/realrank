import { AdminResourcePage } from "@/components/ui/AdminResourcePage";

export default async function AdminSupportRecordPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminResourcePage resource="Support" recordId={id} />;
}
