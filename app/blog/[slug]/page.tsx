import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@/payload.config";

type Props = {
  params: {
    slug: string;
  };
};

async function getPost(slug: string) {
  const payload = await getPayload({ config });

  const posts = await payload.find({
    collection: "blog-posts",
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: "published",
      },
    },
    limit: 1,
  });

  return posts.docs[0] || null;
}

async function getRelatedPosts(postId: string, categories: any[]) {
  const payload = await getPayload({ config });

  if (!categories || categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map((cat) =>
    typeof cat === "string" ? cat : cat.id
  );

  const posts = await payload.find({
    collection: "blog-posts",
    where: {
      and: [
        {
          status: {
            equals: "published",
          },
        },
        {
          id: {
            not_equals: postId,
          },
        },
        {
          categories: {
            in: categoryIds,
          },
        },
      ],
    },
    sort: "-publishedAt",
    limit: 3,
  });

  return posts.docs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found - AWFixer Blog",
    };
  }

  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || post.excerpt;
  const metaImage = post.metaImage || post.featuredImage;

  return {
    title: `${metaTitle} - AWFixer Blog`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://awfixer.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [
        typeof post.author === "string"
          ? post.author
          : post.author?.name || "AWFixer Team",
      ],
      images: metaImage
        ? [
            {
              url:
                typeof metaImage === "string" ? metaImage : metaImage.url || "",
              alt:
                typeof metaImage === "string"
                  ? metaTitle
                  : metaImage.alt || metaTitle,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: metaImage
        ? [typeof metaImage === "string" ? metaImage : metaImage.url || ""]
        : [],
    },
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderRichText(content: any): string {
  if (!content || !content.root) {
    return "";
  }

  try {
    // Simple text extraction from Lexical content
    const extractText = (node: any): string => {
      if (!node) return "";

      if (node.type === "text") {
        return node.text || "";
      }

      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join("");
      }

      return "";
    };

    return extractText(content.root);
  } catch (error) {
    console.error("Error rendering rich text:", error);
    return "";
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories || []
  );

  const author =
    typeof post.author === "string"
      ? { name: "AWFixer Team", email: "" }
      : post.author;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <article className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <Link
                href="/"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                href="/blog"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Blog
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{post.title}</span>
            </nav>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((cat: any) => {
                  const category = typeof cat === "string" ? null : cat;
                  if (!category) return null;
                  return (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className="text-xs font-semibold px-3 py-1 rounded-full text-white hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: category.color || "#3B82F6",
                      }}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{author?.name || "AWFixer Team"}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{post.readTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tagObj: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    #{tagObj.tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-700">
            <Image
              src={
                typeof post.featuredImage === "string"
                  ? post.featuredImage
                  : post.featuredImage.url || ""
              }
              alt={
                typeof post.featuredImage === "string"
                  ? post.title
                  : post.featuredImage.alt || post.title
              }
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </article>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Rich Text Content */}
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {post.content && renderRichText(post.content)}
              </div>

              {/* Fallback if no content renders */}
              {!post.content && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>Content is being prepared. Please check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Enjoyed this article?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Share it with your network or join our Discord community to discuss!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 127.14 96.36"
                  fill="currentColor"
                >
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                Join Discord Community
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost: any) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {relatedPost.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={
                            typeof relatedPost.featuredImage === "string"
                              ? relatedPost.featuredImage
                              : relatedPost.featuredImage.url || ""
                          }
                          alt={
                            typeof relatedPost.featuredImage === "string"
                              ? relatedPost.title
                              : relatedPost.featuredImage.alt || relatedPost.title
                          }
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
