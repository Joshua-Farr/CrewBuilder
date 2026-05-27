import { AuthPanel } from "@/components/auth/auth-panel";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Account", description: "Sign in with Google or email to save decks, bookmark leaders, follow players, and submit tournament reports.", path: "/auth" });
export default function AuthPage() { return <AuthPanel />; }
