/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser'],
  reactStrictMode: true,
};
module.exports = nextConfig;
