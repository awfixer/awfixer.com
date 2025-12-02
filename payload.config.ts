import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "blog-users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Separate admin route for blog CMS
    routes: {
      api: "/blog-admin/api",
      graphQL: "/blog-admin/graphql",
      graphQLPlayground: "/blog-admin/graphql-playground",
    },
    meta: {
      titleSuffix: "- AWFixer Blog",
      favicon: "/favicon.ico",
      ogImage: "/og-image.jpg",
    },
    // Disable default authentication UI (using Discord auth instead)
    disable: false,
  },
  collections: [
    {
      slug: "blog-users",
      auth: {
        // Token expiration matches Discord session
        tokenExpiration: 60 * 60 * 24 * 7, // 7 days
        // Disable email verification since we use Discord
        verify: false,
        // Max login attempts
        maxLoginAttempts: 5,
        lockTime: 600000, // 10 minutes
      },
      admin: {
        useAsTitle: "email",
        description: "Blog admin users linked to whitelisted Discord accounts",
      },
      access: {
        // Only admins can read user list
        read: ({ req: { user } }) => {
          if (!user) return false;
          return user.role === "admin";
        },
        // Only admins can create users
        create: ({ req: { user } }) => {
          if (!user) return false;
          return user.role === "admin";
        },
        // Users can update their own profile, admins can update anyone
        update: ({ req: { user }, id }) => {
          if (!user) return false;
          if (user.role === "admin") return true;
          return user.id === id;
        },
        // Only admins can delete users
        delete: ({ req: { user } }) => {
          if (!user) return false;
          return user.role === "admin";
        },
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "role",
          type: "select",
          options: [
            { label: "Admin", value: "admin" },
            { label: "Editor", value: "editor" },
          ],
          defaultValue: "admin", // All whitelisted users default to admin
          required: true,
          access: {
            // Only admins can change roles
            update: ({ req: { user } }) => {
              if (!user) return false;
              return user.role === "admin";
            },
          },
        },
        {
          name: "discordId",
          type: "text",
          admin: {
            readOnly: true,
            description: "Discord user ID (auto-populated)",
            position: "sidebar",
          },
          unique: true,
        },
      ],
    },
    {
      slug: "blog-posts",
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "author", "status", "publishedAt"],
        group: "Blog",
      },
      versions: {
        drafts: true,
      },
      access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === "admin",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: {
            description:
              'URL-friendly version of the title (e.g., "my-first-post")',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (!value && data?.title) {
                  return data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                }
                return value;
              },
            ],
          },
        },
        {
          name: "excerpt",
          type: "textarea",
          required: true,
          maxLength: 200,
          admin: {
            description:
              "Short description for preview cards and SEO (max 200 characters)",
          },
        },
        {
          name: "content",
          type: "richText",
          required: true,
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [...defaultFeatures],
          }),
        },
        {
          name: "featuredImage",
          type: "upload",
          relationTo: "blog-media",
          admin: {
            description: "Main image for the blog post",
          },
        },
        {
          name: "author",
          type: "relationship",
          relationTo: "blog-users",
          required: true,
          admin: {
            position: "sidebar",
          },
        },
        {
          name: "categories",
          type: "relationship",
          relationTo: "blog-categories",
          hasMany: true,
          admin: {
            position: "sidebar",
          },
        },
        {
          name: "tags",
          type: "array",
          admin: {
            position: "sidebar",
            description: "Add tags for better organization and search",
          },
          fields: [
            {
              name: "tag",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "draft",
          required: true,
          admin: {
            position: "sidebar",
          },
        },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            position: "sidebar",
            description: "Show this post as featured on the blog homepage",
          },
        },
        {
          name: "publishedAt",
          type: "date",
          admin: {
            position: "sidebar",
            date: {
              pickerAppearance: "dayAndTime",
            },
            description: "Leave empty to use the current date when publishing",
          },
        },
        {
          name: "readTime",
          type: "number",
          admin: {
            position: "sidebar",
            description:
              "Estimated reading time in minutes (auto-calculated if empty)",
          },
        },
        {
          type: "tabs",
          tabs: [
            {
              label: "SEO",
              fields: [
                {
                  name: "metaTitle",
                  type: "text",
                  admin: {
                    description: "SEO title (leave empty to use post title)",
                  },
                },
                {
                  name: "metaDescription",
                  type: "textarea",
                  admin: {
                    description: "SEO description (leave empty to use excerpt)",
                  },
                },
                {
                  name: "metaImage",
                  type: "upload",
                  relationTo: "blog-media",
                  admin: {
                    description:
                      "Social media share image (leave empty to use featured image)",
                  },
                },
              ],
            },
          ],
        },
      ],
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            // Auto-set publishedAt if status changes to published and no date is set
            if (data.status === "published" && !data.publishedAt) {
              data.publishedAt = new Date().toISOString();
            }

            // Calculate read time if not set (rough estimate: 200 words per minute)
            if (!data.readTime && data.content) {
              const text = JSON.stringify(data.content);
              const wordCount = text.split(/\s+/).length;
              data.readTime = Math.ceil(wordCount / 200);
            }

            return data;
          },
        ],
      },
    },
    {
      slug: "blog-categories",
      admin: {
        useAsTitle: "name",
        group: "Blog",
      },
      access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === "admin",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (!value && data?.name) {
                  return data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                }
                return value;
              },
            ],
          },
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "color",
          type: "text",
          defaultValue: "#3B82F6",
          admin: {
            description: "Hex color code for category badge (e.g., #3B82F6)",
          },
        },
      ],
    },
    {
      slug: "blog-media",
      admin: {
        group: "Blog",
      },
      upload: {
        staticDir: "public/blog-media",
        imageSizes: [
          {
            name: "thumbnail",
            width: 400,
            height: 300,
            position: "centre",
          },
          {
            name: "card",
            width: 768,
            height: 432,
            position: "centre",
          },
          {
            name: "feature",
            width: 1200,
            height: 630,
            position: "centre",
          },
        ],
        adminThumbnail: "thumbnail",
        mimeTypes: ["image/*"],
      },
      access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === "admin",
      },
      fields: [
        {
          name: "alt",
          type: "text",
          required: true,
          admin: {
            description: "Alternative text for accessibility and SEO",
          },
        },
        {
          name: "caption",
          type: "text",
        },
      ],
    },
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    "http://localhost:3000", // Always allow localhost for development
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    "http://localhost:3000", // Always allow localhost for development
  ].filter(Boolean),
  // Custom endpoints for Discord auth integration
  endpoints: [
    {
      path: "/blog-admin-check",
      method: "get",
      handler: async (req, res) => {
        // Health check endpoint for blog admin
        res.status(200).json({
          message: "Blog admin is configured with Discord authentication",
          authMethod: "discord-whitelist",
        });
      },
    },
  ],
});
