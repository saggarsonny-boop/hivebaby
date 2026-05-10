/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

const nextConfig = {
  transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser'],
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);