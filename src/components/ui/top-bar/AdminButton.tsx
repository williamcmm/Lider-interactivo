"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiSettings } from "react-icons/fi";

interface AdminButtonProps {
  compact?: boolean;
}

export function AdminButton({ compact = false }: AdminButtonProps) {
  const { data } = useSession();
  const role = (data as any)?.user?.role;
  const isAdmin = role === "ADMIN";

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className={
        compact
          ? "flex items-center p-1.5 text-white bg-green-700 rounded-md hover:bg-green-800 transition duration-150"
          : "flex items-center p-2 ml-1 text-white bg-green-700 rounded-md hover:bg-green-800 transition duration-150"
      }
    >
      <FiSettings className={compact ? "w-4 h-4" : "w-5 h-5 mr-0 md:mr-2"} />
      {!compact && <span className="hidden md:inline">Admin</span>}
    </Link>
  );
}
