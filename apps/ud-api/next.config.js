/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser'],
};
module.exports = nextConfig;
