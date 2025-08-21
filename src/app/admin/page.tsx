'use client';

import { AdminPanel } from '@/components/admin/AdminPanel';
import { getSeminarsAndSeries } from '@/actions/admin/get-seminar-and-series';
import type { DbSeminar, DbSeries } from '@/types/db';
import { useIsAdmin, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [initialSeminars, setInitialSeminars] = useState<DbSeminar[]>([]);
  const [initialSeries, setInitialSeries] = useState<DbSeries[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return; // Esperar a que termine la carga de autenticación
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/403');
      return;
    }

    // Cargar datos si es admin
    const loadData = async () => {
      try {
        const result = await getSeminarsAndSeries();
        setInitialSeminars(result.ok ? result.seminars : []);
        setInitialSeries(result.ok ? result.series : []);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, loading, isAdmin, router]);

  if (loading || dataLoading) {
    return <Loading />;
  }

  if (!user || !isAdmin) {
    return null; // El useEffect ya manejó la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={initialSeminars} initialSeries={initialSeries} />
    </div>
  );
}
