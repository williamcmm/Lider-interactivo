"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { getSeminarsAndSeries } from "@/actions/admin/get-seminar-and-series";
import type { DbSeminar, DbSeries } from "@/types/db";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/Loading";
import { logger } from "@/utils/logger";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminPage() {
  const [seminars, setSeminars] = useState<DbSeminar[]>([]);
  const [series, setSeries] = useState<DbSeries[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <Loading />
        ) : (
          <AdminPanel initialSeminars={seminars} initialSeries={series} />
        )}
      </div>
    </AdminGuard>
  );
}
