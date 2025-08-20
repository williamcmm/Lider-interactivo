import { StudyApp } from '@/components/StudyApp';

import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';

export default async function Home() {
  const result = await getSeminarsAndSeries();
  const initialSeminars = result.ok ? result.seminars : [];
  const initialSeries = result.ok ? result.series : [];

  return (
    <StudyApp initialSeminars={initialSeminars as any} initialSeries={initialSeries as any} />
  );
}
