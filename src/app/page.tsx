import { StudyApp } from '@/components/StudyApp';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import { auth } from '@/auth.config';
import type { DbSeminar, DbSeries } from '@/types/db';

export default async function Home() {
  const session = await auth();
  
  // Solo obtener datos reales si hay sesión activa
  let initialSeminars: DbSeminar[] = [];
  let initialSeries: DbSeries[] = [];
  
  if (session) {
    const result = await getSeminarsAndSeries();
    initialSeminars = result.ok ? (result.seminars as DbSeminar[]) : [];
    initialSeries = result.ok ? (result.series as DbSeries[]) : [];
  }

  return (
  <StudyApp 
    initialSeminars={initialSeminars} 
    initialSeries={initialSeries}
    session={session}
  />
  );
}
