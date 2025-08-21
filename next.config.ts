import type { NextConfig } from "next";
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Evita que Webpack intente "resolver" los engines de Prisma como dependencias
      config.externals.push('_http_common');
    }

    // Plugin oficial de Prisma para que copie los engines al bundle
    config.plugins.push(new PrismaPlugin());

    return config;
  }
};

export default nextConfig;
