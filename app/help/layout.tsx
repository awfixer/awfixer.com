import { RootProvider } from "fumadocs-ui/provider/next";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <Analytics />
      {children}
    </RootProvider>
  );
}
