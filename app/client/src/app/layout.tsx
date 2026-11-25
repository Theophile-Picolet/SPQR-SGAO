import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/global.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "SGAO",
  description: "Suivi des références commerciales",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
