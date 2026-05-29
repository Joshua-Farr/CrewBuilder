import { requireAdmin } from "@/lib/auth/require-admin";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
