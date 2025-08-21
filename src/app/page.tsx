import { StudyApp } from '@/components/StudyApp';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import type { DbSeminar, DbSeries } from '@/types/db';

export default async function Home() {
  // Solo obtener datos si hay autenticación válida
  // La validación se hace en el componente StudyApp para mostrar contenido restringido
  let initialSeminars: DbSeminar[] = [];
  let initialSeries: DbSeries[] = [];

  try {
    const result = await getSeminarsAndSeries();
    if (result.ok) {
      initialSeminars = result.seminars as DbSeminar[];
      initialSeries = result.series as DbSeries[];
    }
  } catch (error) {
    // En caso de error, mantener arrays vacíos
    console.error('Error loading initial data:', error);
  }

  return (
    <StudyApp 
      initialSeminars={initialSeminars} 
      initialSeries={initialSeries}
    />
  );
}
