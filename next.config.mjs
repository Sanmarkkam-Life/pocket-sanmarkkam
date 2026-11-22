/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // The app may be shown inside a page on sanmarkkamlife.org, and nowhere else.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://sanmarkkamlife.org https://*.sanmarkkamlife.org",
          },
        ],
      },
      {
        // Book data changes only when the books are re-exported; let phones revalidate.
        source: "/data/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
