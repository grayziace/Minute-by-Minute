import { DayEpisodePage } from "@/components/timeline/DayEpisodePage";

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <DayEpisodePage date={date} />;
}
