import { AdminPanel } from '@/components/admin/AdminPanel';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import type { DbSeminar, DbSeries } from '@/types/db';
import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { firebaseLogger } from '@/utils/logger';
import { Suspense } from 'react';
import { Loading } from '@/components/ui/Loading';

// Componente que maneja la validación y carga de datos
async function AdminContent() {
  // Validación de autenticación y rol en servidor
  const user = await getCurrentUser();
  
  firebaseLogger.auth("Admin page access attempt:", user ? { email: user.email, role: user.role } : 'no user');
  
  if (!user) {
    firebaseLogger.error("No authenticated user - redirecting to login");
    redirect('/auth/login?error=unauthenticated&from=/admin');
  }

  if (user.role !== 'ADMIN') {
    firebaseLogger.error("User is not admin - redirecting to 403", { email: user.email, role: user.role });
    redirect('/403');
  }

  // Si llega aquí, el usuario es admin autenticado
  firebaseLogger.success("Admin access granted in server component:", user.email);
  
  // Cargar datos administrativos
  const result = await getSeminarsAndSeries();
  const initialSeminars: DbSeminar[] = result.ok ? (result.seminars as DbSeminar[]) : [];
  const initialSeries: DbSeries[] = result.ok ? (result.series as DbSeries[]) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={initialSeminars} initialSeries={initialSeries} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminContent />
    </Suspense>
  );
}
