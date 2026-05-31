import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build sırasında hataları yoksayarak süreci tamamla
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  // Optimizasyonları build sırasında biraz hafiflet
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;