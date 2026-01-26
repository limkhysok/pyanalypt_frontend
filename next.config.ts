import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["localhost:3000", "172.18.80.1:3000", "172.18.176.1:3000"],
};

export default nextConfig;
