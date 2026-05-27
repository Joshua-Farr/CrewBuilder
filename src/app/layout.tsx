import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { createMetadata } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = createMetadata({});
export const viewport: Viewport = { themeColor: "#050816", colorScheme: "dark" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="dark"><body><QueryProvider><AuthProvider><div className="pointer-events-none fixed inset-0 noise-overlay" /><SiteHeader /><main className="relative mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main><SiteFooter /></AuthProvider></QueryProvider></body></html>; }
