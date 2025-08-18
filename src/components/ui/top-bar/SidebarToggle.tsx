"use client";

import { FiX } from "react-icons/fi";
import { useSidebarStore } from "@/store/sidebarStore";

export function SidebarToggle() {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  return (
    <button
      onClick={toggleSidebar}
      className="md:hidden flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors mr-2"
      aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
    >
      {isSidebarOpen ? (
        <FiX className="w-6 h-6" />
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}
