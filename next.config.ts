import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.0.101:3000",
    "192.168.0.101",
    "http://192.168.0.101:3000",
    "http://localhost:3000"
  ],
};

export default nextConfig;
