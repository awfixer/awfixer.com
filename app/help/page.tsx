import { source } from '@/lib/source';
import Link from 'next/link';

export default function HelpPage() {
  const pages = source.getPages();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and learn how to use AWFixer.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.url}
                href={page.url}
                className="group block p-6 bg-card rounded-lg border hover:border-primary/50 hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {page.data.title}
                </h2>
                {page.data.description && (
                  <p className="text-muted-foreground">
                    {page.data.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-primary hover:underline"
            >
              ← Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
