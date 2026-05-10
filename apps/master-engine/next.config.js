/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser'],
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_Y2hvaWNlLWRhc3NpZS02NS5jbGVyay5hY2NvdW50cy5kZXYk",
    CLERK_SECRET_KEY: "sk_test_NZX6GkWzVeHuY4WKI8Fw8Qlh43i17pFF9la6Rx6AWB"
  }
};
module.exports = nextConfig;
