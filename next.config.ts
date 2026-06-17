import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in the home dir otherwise confuses inference).
  turbopack: { root: import.meta.dirname },
  images: {
    // Allow remote listing/store images served from the configured object store.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
