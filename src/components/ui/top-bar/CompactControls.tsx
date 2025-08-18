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

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const startCasting = async () => {
    try {
      if ("presentation" in navigator) {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        const request = new (window as any).PresentationRequest([
          presentationUrl,
        ]);
        const connection = await request.start();
        setIsCasting(true);
        setPresentationRequest(request);
        if (currentFragment) {
          const slideContent =
            currentFragment.slides && currentFragment.slides.length > 0
              ? currentFragment.slides[0].content
              : "";
          connection.send(
            JSON.stringify({
              type: "update-slide",
              slide: slideContent,
              fragmentIndex: fragmentIndex,
              lessonTitle: currentLesson?.title,
            })
          );
        }
      } else {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        window.open(presentationUrl, "_blank", "width=1280,height=720");
      }
    } catch (error) {
      console.error("Error al iniciar presentación:", error);
      alert(
        "No se pudo conectar a una pantalla externa. Asegúrate de que haya dispositivos compatibles disponibles."
      );
    }
  };

  const shareSlide = () => {
    if (!currentLesson || !currentFragment) {
      alert("No hay una lección o fragmento seleccionado para compartir.");
      return;
    }
    setShowShareModal(true);
  };

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
        isCasting={isCasting}
        canCast={canCast}
        canShare={canShare}
        onFullscreenAction={handleFullscreen}
        onCastAction={startCasting}
        onShareAction={shareSlide}
      />
      <AuthButton compact />
    </div>
  );
}
