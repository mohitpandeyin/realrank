import { AdminResourcePage } from "@/components/ui/AdminResourcePage";

export default async function AdminTeamRecordPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminResourcePage resource="Team member" recordId={id} />;
}
