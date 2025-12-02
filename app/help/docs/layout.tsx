import { source } from '@/lib/source';
import { Analytics } from "@vercel/analytics/next"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions()}>
      <Analytics/>
      {children}
    </DocsLayout>
  );
}
