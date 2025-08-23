"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { getSeminarsAndSeries } from "@/actions/admin/get-seminar-and-series";
import type { DbSeminar, DbSeries } from "@/types/db";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/Loading";
import { logger } from "@/utils/logger";
import { useIsAdmin, useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const [seminars, setSeminars] = useState<DbSeminar[]>([]);
  const [series, setSeries] = useState<DbSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading, user } = useAuth();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    async function loadAdminData() {
      try {
        const result = await getSeminarsAndSeries();
        if (result.ok) {
          setSeminars(result.seminars as DbSeminar[]);
          setSeries(result.series as DbSeries[]);
        } else {
          logger.error("❌ Failed to load admin data:", result.error);
        }
      } catch (error) {
        logger.error("💥 Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Debes iniciar sesión</h2>
          <p className="text-gray-500">Acceso solo para administradores</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Acceso denegado</h2>
          <p className="text-gray-500">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={seminars} initialSeries={series} />
    </div>
  );
}
