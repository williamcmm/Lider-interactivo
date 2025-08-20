import { AdminPanel } from '@/components/admin/AdminPanel';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';

export default async function AdminPage() {
  const result = await getSeminarsAndSeries();
  const initialSeminars = result.ok ? result.seminars : [];
  const initialSeries = result.ok ? result.series : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={initialSeminars as any} initialSeries={initialSeries as any} />
    </div>
  );
}
