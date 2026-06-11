import 'dotenv/config'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

function getR2ImagePatterns(): Array<{
  protocol: 'https'
  hostname: string
}> {
  const patterns: Array<{ protocol: 'https'; hostname: string }> = [
    { protocol: 'https', hostname: '**.r2.dev' },
  ]

  if (process.env.R2_PUBLIC_URL) {
    try {
      const hostname = new URL(process.env.R2_PUBLIC_URL).hostname
      if (!patterns.some((p) => p.hostname === hostname)) {
        patterns.push({ protocol: 'https', hostname })
      }
    } catch {
      // ignore invalid R2_PUBLIC_URL
    }
  }

  return patterns
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dreamtourism.it',
      },
      {
        protocol: 'https',
        hostname: '*.bokun.io',
      },
      ...getR2ImagePatterns(),
    ],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  experimental: {
    reactCompiler: false,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
