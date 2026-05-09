import { AppShell } from "@/components/layout/app-shell"

export default function PublicAppLayout({ children }: { children: React.ReactNode }) {
  // Renders the AppShell (sidebar + topbar) but DOES NOT enforce authentication.
  return <AppShell>{children}</AppShell>
}
