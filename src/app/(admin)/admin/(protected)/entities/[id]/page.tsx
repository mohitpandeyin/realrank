import { AdminResourcePage } from "@/components/ui/AdminResourcePage";

export default async function AdminEntityPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminResourcePage resource="Entity" recordId={id} />;
}
