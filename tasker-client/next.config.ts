import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_S3_PUBLIC_IMAGE_URL || "")
          .hostname,
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
