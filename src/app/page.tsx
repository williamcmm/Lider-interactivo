import { StudyApp } from '@/components/StudyApp';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import type { DbSeminar, DbSeries } from '@/types/db';

export default async function Home() {
  // Obtener datos públicos siempre (la app se encargará de filtrar según autenticación)
  const result = await getSeminarsAndSeries();
  const initialSeminars: DbSeminar[] = result.ok ? (result.seminars as DbSeminar[]) : [];
  const initialSeries: DbSeries[] = result.ok ? (result.series as DbSeries[]) : [];

  return (
    <StudyApp 
      initialSeminars={initialSeminars} 
      initialSeries={initialSeries}
    />
  );
}
