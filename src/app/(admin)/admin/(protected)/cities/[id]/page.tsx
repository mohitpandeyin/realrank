import { AdminResourcePage } from "@/components/ui/AdminResourcePage";

export default async function AdminCityPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminResourcePage resource="City" recordId={id} />;
}
