"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
export function QueryProvider({ children }: { children: React.ReactNode }) { const [client] = React.useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30, refetchOnWindowFocus: false } } })); return <QueryClientProvider client={client}>{children}{process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}</QueryClientProvider>; }
