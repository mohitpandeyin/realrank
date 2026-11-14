import { FoundationPage } from "@/components/ui/FoundationPage";

export function AdminResourcePage({
  resource,
  recordId,
}: Readonly<{ resource: string; recordId?: string }>) {
  const title = recordId ? `${resource} record` : resource;
  const description = recordId
    ? `Protected ${resource.toLowerCase()} record route reserved for ${recordId}.`
    : `Protected ${resource.toLowerCase()} list route reserved for the admin milestone.`;

  return <FoundationPage eyebrow="Internal operations" title={title} description={description} />;
}
