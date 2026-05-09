import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAppUser } from "@/lib/auth/app-user"
import { z } from "zod"

const budgetSchema = z.object({
  category: z.enum(["TRANSPORT", "STAY", "FOOD", "ACTIVITIES", "SHOPPING", "MISC"]),
  amount: z.coerce.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP", "INR", "AED", "SGD", "AUD", "CAD", "JPY"]),
  details: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const user = await requireAppUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tripId } = await params

    const body = await req.json()
    const parsed = budgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 })
    }

    // Verify trip belongs to user or they are a collaborator
    const trip = await db.trip.findFirst({
      where: {
        id: tripId,
        OR: [{ ownerId: user.id }, { collaborators: { some: { userId: user.id } } }],
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or access denied" }, { status: 404 })
    }

    const budget = await db.budget.create({
      data: {
        tripId,
        category: parsed.data.category,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        planned: true, // As this is "Planned Budget"
      },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (err) {
    console.error("Budget API error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
