"use client";

import React, { useState } from "react";
import { FiGrid } from "react-icons/fi";
import { AuthButton } from "./AuthButton";
import { AdminButton } from "./AdminButton";
import { ActionButtonsMobile } from "./ActionButtonsMobile";
import { Fragment, Lesson } from "@/types";

interface CompactControlsProps {
  panelOptions: { key: string; icon: React.ReactNode }[];
  activePanel: string;
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  canCast: boolean;
  canShare: boolean;
  setActivePanelAction: (panel: string) => void;
}

export function CompactControls({
  panelOptions,
  activePanel,
  currentFragment,
  currentLesson,
  fragmentIndex,
  canCast,
  canShare,
  setActivePanelAction,
}: CompactControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [presentationRequest, setPresentationRequest] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="flex items-center space-x-1 flex-1 justify-end">
      {/* Botones de Login y Admin para móvil */}
      <AdminButton compact />

      {/* Navegación de paneles para móvil */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {panelOptions.map((panel) => (
          <button
            key={panel.key}
            className={`p-1.5 rounded transition-colors duration-150 ${
              activePanel === panel.key
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActivePanelAction(panel.key)}
          >
            {panel.icon}
          </button>
        ))}
        {/* Botón "All" para móvil */}
        <button
          className={`p-1.5 rounded transition-colors duration-150 ${
            activePanel === "all"
              ? "bg-blue-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActivePanelAction("all")}
        >
          <FiGrid className="w-4 h-4" />
        </button>
      </div>

      {/* Botones de acción para móvil */}
      <ActionButtonsMobile
        canCast={canCast}
        canShare={canShare}
        currentFragment={currentFragment}
        currentLesson={currentLesson}
        fragmentIndex={fragmentIndex}
      />
      <AuthButton compact />
    </div>
  );
}
