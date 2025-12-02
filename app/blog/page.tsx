import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@/payload.config";

export const metadata: Metadata = {
  title: "Blog - AWFixer",
  description: "Latest articles, tutorials, and insights from AWFixer",
  openGraph: {
    title: "Blog - AWFixer",
    description: "Latest articles, tutorials, and insights from AWFixer",
    url: "https://awfixer.com/blog",
  },
};

async function getBlogPosts() {
  const payload = await getPayload({ config });

  const posts = await payload.find({
    collection: "blog-posts",
    where: {
      status: {
        equals: "published",
      },
    },
    sort: "-publishedAt",
    limit: 50,
  });

  return posts;
}

async function getCategories() {
  const payload = await getPayload({ config });

  const categories = await payload.find({
    collection: "blog-categories",
    limit: 100,
  });

  return categories;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { docs: posts } = await getBlogPosts();
  const { docs: categories } = await getCategories();

  // Filter by category if specified
  const filteredPosts = searchParams.category
    ? posts.filter((post: any) =>
        post.categories?.some(
          (cat: any) =>
            (typeof cat === "string" ? cat : cat.slug) ===
            searchParams.category,
        ),
      )
    : posts;

  // Get featured posts
  const featuredPosts = posts.filter((post: any) => post.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AWFixer Blog
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Technical insights, tutorials, and the latest from the AWFixer
              community
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Filter:
              </span>
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  !searchParams.category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                All Posts
              </Link>
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    searchParams.category === category.slug
                      ? "text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  style={
                    searchParams.category === category.slug
                      ? { backgroundColor: category.color || "#3B82F6" }
                      : {}
                  }
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchParams.category && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Featured Posts
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={
                          typeof post.featuredImage === "string"
                            ? post.featuredImage
                            : post.featuredImage.url
                        }
                        alt={
                          typeof post.featuredImage === "string"
                            ? post.title
                            : post.featuredImage.alt || post.title
                        }
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.readTime && <span>{post.readTime} min read</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {searchParams.category ? "Filtered Posts" : "Latest Posts"}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchParams.category
                    ? "No posts in this category yet. Check back soon!"
                    : "No blog posts have been published yet. Check back soon!"}
                </p>
                {searchParams.category && (
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    View All Posts
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={
                          typeof post.featuredImage === "string"
                            ? post.featuredImage
                            : post.featuredImage.url
                        }
                        alt={
                          typeof post.featuredImage === "string"
                            ? post.title
                            : post.featuredImage.alt || post.title
                        }
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.slice(0, 2).map((cat: any) => {
                          const category = typeof cat === "string" ? null : cat;
                          if (!category) return null;
                          return (
                            <span
                              key={category.id}
                              className="text-xs font-semibold px-2 py-1 rounded text-white"
                              style={{
                                backgroundColor: category.color || "#3B82F6",
                              }}
                            >
                              {category.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.readTime && <span>{post.readTime} min read</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Admin Access */}
        <section className="mt-16 text-center">
          <div className="inline-block bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Blog administrator?
            </p>
            <Link
              href="/blog-admin"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Manage Blog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
