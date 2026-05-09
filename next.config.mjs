/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["@netlify/database", "@prisma/client"],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig