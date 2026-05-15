/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Keep ffmpeg-static as an external to avoid bundling the binary
      config.externals = [...(config.externals || []), 'ffmpeg-static', 'fluent-ffmpeg']
    }
    return config
  },
}

module.exports = nextConfig
