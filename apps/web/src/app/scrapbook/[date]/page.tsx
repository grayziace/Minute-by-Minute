import { ScrapbookDayPage } from "@/components/scrapbook/ScrapbookDayPage";

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <ScrapbookDayPage date={date} />;
}
