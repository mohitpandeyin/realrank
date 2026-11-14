import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

export function PublicInfoPage({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <PublicShell>
      <FoundationPage eyebrow="Realrank" title={title} description={description} />
    </PublicShell>
  );
}
