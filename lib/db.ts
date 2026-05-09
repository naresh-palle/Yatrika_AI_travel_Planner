import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string | undefined {
  try {
    const { getConnectionString } = require("@netlify/database") as typeof import("@netlify/database")
    return getConnectionString()
  } catch {
    return process.env.DATABASE_URL
  }
}

const url = getDatabaseUrl()

export const db =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  })

if (process.env.NODE_ENV !== "production") globalThis.__prisma = db

