import { getDemos } from "@/lib/db"
import { DemosClient } from "./DemosClient"

export default async function DemosPage() {
  const demos = await getDemos()

  return <DemosClient demos={demos} />
}