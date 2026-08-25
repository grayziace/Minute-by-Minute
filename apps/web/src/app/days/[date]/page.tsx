import { redirect } from "next/navigation";

export default async function DayRedirect({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/timeline/${date}`);
}
