import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Login",
  description: "Sign in to the AllBlue.gg admin CMS.",
  path: "/admin/login",
});

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
