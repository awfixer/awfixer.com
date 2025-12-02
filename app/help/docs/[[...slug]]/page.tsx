import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const MDX = (page.data as any).body;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{page.data.title}</h1>
          {(page.data as any).description && (
            <p className="text-xl text-muted-foreground">
              {(page.data as any).description}
            </p>
          )}
        </header>

        <div className="mdx-content">
          <MDX />
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    return {};
  }

  return {
    title: (page.data as any).title,
    description: (page.data as any).description,
  };
}
