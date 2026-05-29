import { requireModerator } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireModerator();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="admin-shell fixed inset-0 z-50 flex bg-background text-foreground">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
