import Script from "next/script";

export default function BlogPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                AWFixer Blog
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Blogs, News and Resources about all things AWFixer and Friends
              </p>

              {/* Visit Blog Button */}
              <a
                href="https://awfixer.blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Visit AWFixer Blog
                <svg
                  className="ml-3 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {/* Ghost Signup Form Embed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div
                className="w-full p-8"
                style={{
                  height: "40vmin",
                  minHeight: "360px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div id="ghost-signup-form" className="w-full h-full">
                  {/* Ghost signup form will be injected here */}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with the latest from AWFixer and Friends community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost Signup Form Script */}
      <Script
        src="https://cdn.jsdelivr.net/ghost/signup-form@~0.3/umd/signup-form.min.js"
        data-background-color="#08090c"
        data-text-color="#FFFFFF"
        data-button-color="#8a88eb"
        data-button-text-color="#FFFFFF"
        data-title="AW&Friends Blog"
        data-description="Blogs, News and Resources about all things AWFixer and Friends"
        data-icon="https://awfixer.blog/content/images/size/w192h192/size/w256h256/2025/11/237357349-1.jpeg"
        data-site="https://awfixer.blog/"
        data-locale="en"
        strategy="afterInteractive"
      />
    </>
  );
}
