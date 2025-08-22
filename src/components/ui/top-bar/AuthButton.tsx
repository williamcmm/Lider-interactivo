"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useSession } from "@/context/AuthContext";

interface AuthButtonProps {
  compact?: boolean; // true for mobile icon-only
}

export function AuthButton({ compact = false }: AuthButtonProps) {
  const { status } = useSession()
  
  const isAuth = status === "authenticated";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!isAuth) {
    return (
      <Link
        href="/auth/login"
        className={
          compact
            ? "flex items-center p-1.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 gap-1 cursor-pointer"
            : "flex items-center p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 gap-1 cursor-pointer"
        }
      >
        <FiUser className={compact ? "w-4 h-4" : "w-5 h-5 mr-0 md:mr-2"} />
        {!compact && <span className="hidden md:inline">Ingresar</span>}
      </Link>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className={
        compact
          ? "flex items-center p-1.5 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150 gap-1 cursor-pointer"
          : "flex items-center p-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150 gap-1 cursor-pointer"
      }
    >
      {/* Simple logout icon */}
      <FiLogOut/>
      {!compact && <span className="hidden md:inline">Salir</span>}
    </button>
  );
}
