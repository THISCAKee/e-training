import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", port: "" },
      // ถ้าใช้โดเมนอื่น ๆ ใส่เพิ่มได้
      // { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false; // ปิดการใช้ eval() ใน sourcemap dev mode
    }
    return config;
  },
};

export default nextConfig;
