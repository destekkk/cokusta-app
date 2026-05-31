import { requireApprovedProvider } from "@/lib/provider-guard";

export default async function UstaPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireApprovedProvider();
  return children;
}
