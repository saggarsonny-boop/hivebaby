const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
  transpilePackages: ['@hive/onboarding'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
