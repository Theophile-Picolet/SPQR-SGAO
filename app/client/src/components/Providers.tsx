"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { retryPolicy } from "@/helpers/retryPolicy";

export default function Providers({ children }: { children: ReactNode }) {
  // One client per browser tab, created once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Business data is always refetched; freshness is checked with the ETag
            staleTime: 0,
            // Unused data stays in memory 5 minutes (the TanStack default, written down on purpose):
            // going back to a page shows it at once while it refreshes. Memory only, never persisted.
            gcTime: 5 * 60 * 1000,
            retry: retryPolicy,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
