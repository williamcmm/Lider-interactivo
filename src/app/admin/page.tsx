"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { getSeminarsAndSeries } from "@/actions/admin/get-seminar-and-series";
import type { DbSeminar, DbSeries } from "@/types/db";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/Loading";
import { logger } from "@/utils/logger";
import { useIsAdmin, useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

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
          logger.error("❌ Failed to load admin data:", result.message);
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
    redirect("/auth/login");
  }

  if (!isAdmin) {
    redirect("/403");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel initialSeminars={seminars} initialSeries={series} />
    </div>
  );
}
