const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Repo root is two levels up (apps/parkback → repo). Turbopack needs to
  // see the workspace root so the @hive/onboarding tsconfig path alias can
  // resolve to packages/hive-onboarding/src/.
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
  // Ensure the shared package's TS source is transpiled by Next's compiler
  // alongside the app — the package ships source-only, no build step.
  transpilePackages: ['@hive/onboarding'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
