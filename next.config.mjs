/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
