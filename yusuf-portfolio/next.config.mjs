/** @type {import('next').NextConfig} */
const nextConfig = {
  // Always wipe .next on startup — prevents stale-chunk 500/404 errors
  cleanDistDir: true,

  webpack(config, { dev }) {
    if (dev) {
      // Disable webpack filesystem cache in dev — prevents chunk-manifest
      // desync when HMR gets confused after rapid edits or file additions
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
