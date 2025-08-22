"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/Loading";
import { logger } from "@/utils/logger";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
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
    if (!authLoading && !isChecking) {
      // Verificación de autenticación básica
      if (!user) {
        logger.warn("🚫 AdminGuard: No user found, redirecting to login");
        router.replace(
          "/auth/login?error=unauthenticated&from=/admin&reason=client_guard"
        );
        return;
      }

      // Verificación de rol de cliente
      if (user.role !== "ADMIN") {
        logger.warn("🚫 AdminGuard: User is not admin, redirecting to 403");
        router.replace("/403?reason=client_role_check");
        return;
      }
    }
  }, [
    user, 
    authLoading, 
    isChecking, 
    router
  ]);

  // Mostrar loading mientras se verifica
  if (authLoading || isChecking) {
    return <Loading />;
  }

  // Si no hay usuario o no es admin, no renderizar nada (la redirección ya se ejecutó)
  if (!user || user.role !== "ADMIN") {
    return <Loading />;
  }

  // Usuario autenticado en cliente y es admin, renderizar contenido
  logger.info("✅ AdminGuard: Client validation passed, rendering admin content");
  return <>{children}</>;
}
