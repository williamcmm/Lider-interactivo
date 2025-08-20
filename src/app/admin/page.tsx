import { AdminPanel } from '@/components/admin/AdminPanel';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import type { DbSeminar, DbSeries } from '@/types/db';

export default async function AdminPage() {
  const result = await getSeminarsAndSeries();
  const initialSeminars: DbSeminar[] = result.ok ? result.seminars : [];
  const initialSeries: DbSeries[] = result.ok ? result.series : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={initialSeminars} initialSeries={initialSeries} />
    </div>
  );
}
