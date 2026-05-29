import { AdminSessionProvider } from "@/components/providers/session-provider";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>;
}
