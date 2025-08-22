"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/Loading";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Dar tiempo para que la autenticación se establezca
    const timeout = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading && !isChecking) {
      if (!user) {
        router.replace(
          "/auth/login?error=unauthenticated&from=/admin&reason=client_guard"
        );
        return;
      }

      if (user.role !== "ADMIN") {
        router.replace("/403");
        return;
      }
    }
  }, [user, loading, isChecking, router]);

  // Mostrar loading mientras se verifica
  if (loading || isChecking) {
    return <Loading />;
  }

  // Si no hay usuario o no es admin, no renderizar nada (la redirección ya se ejecutó)
  if (!user || user.role !== "ADMIN") {
    return <Loading />;
  }

  // Usuario autenticado y es admin, renderizar contenido
  return <>{children}</>;
}
