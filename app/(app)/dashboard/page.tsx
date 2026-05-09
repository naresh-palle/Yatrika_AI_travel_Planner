import { requireAppUser } from "@/lib/auth/app-user"
import { listTripsAccessibleByUser } from "@/modules/trips/repository"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await requireAppUser()
  if (!user) {
    redirect("/sign-in")
  }

  const trips = await listTripsAccessibleByUser(user.id)

  return <DashboardContent firstName={user?.name?.split(" ")[0]} trips={trips} />
}

