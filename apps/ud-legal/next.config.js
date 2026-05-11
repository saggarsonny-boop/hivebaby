/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser'],
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
