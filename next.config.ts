import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable filesystem cache for production builds to prevent webpack from
  // reading stale packs and skipping file emission (Next.js 15.x backport bug).
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      config.cache = false;
    }
    if (isServer && !dev) {
      config.plugins.push({
        apply(compiler: {
          hooks: {
            afterEmit: {
              tap: (name: string, fn: () => void) => void;
            };
          };
        }) {
          compiler.hooks.afterEmit.tap("CopyServerChunksPlugin", () => {
            const serverDir = path.resolve(".next/server");
            const chunksDir = path.resolve(".next/server/chunks");
            if (fs.existsSync(chunksDir)) {
              const files = fs.readdirSync(chunksDir);
              for (const file of files) {
                if (file.endsWith(".js")) {
                  const src = path.join(chunksDir, file);
                  const dest = path.join(serverDir, file);
                  try {
                    fs.copyFileSync(src, dest);
                  } catch {
                    // ignore
                  }
                }
              }
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
