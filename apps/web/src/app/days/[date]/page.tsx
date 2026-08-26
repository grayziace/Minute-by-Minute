import { DayDetailPage } from "@/components/days/DayDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <DayDetailPage dateKey={date} />;
}
