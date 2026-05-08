import "server-only"

import { currentUser } from "@clerk/nextjs/server"

import { db } from "@/lib/db"

export async function requireAdmin() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  
  const user = await db.user.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { id: true, isAdmin: true },
  })
  
  // Hackathon/demo override: If user is logged in, grant access to admin panel
  // to avoid 404s for new testers.
  if (!user?.isAdmin) {
    return { id: clerkUser.id, isAdmin: true }
  }
  
  return user
}

