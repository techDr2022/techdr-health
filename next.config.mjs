const r2Endpoint = process.env.CLOUDFLARE_R2_S3_ENDPOINT;
const r2PublicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

const remotePatterns = [];

if (r2Endpoint) {
  try {
    const url = new URL(r2Endpoint);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      pathname: "/**",
    });
  } catch {
    // Ignore invalid endpoint URL to avoid breaking builds.
  }
}

if (r2PublicBaseUrl) {
  try {
    const url = new URL(r2PublicBaseUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      pathname: "/**",
    });
  } catch {
    // Ignore invalid public base URL to avoid breaking builds.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.techdrhealth.com" }],
        destination: "https://techdrhealth.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
