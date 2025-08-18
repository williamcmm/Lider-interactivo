"use client";

import React, { useState, useEffect } from "react";
import { FiGrid } from "react-icons/fi";
import { Fragment, Lesson } from "@/types";
import { AuthButton } from "./AuthButton";
import { AdminButton } from "./AdminButton";
import { DesktopPanelButtons } from "./DesktopPanelButtons";
import { ActionButtons } from "./ActionButtons";
import { ShareModal } from "../ShareModal";
import { panelOptions } from "./panel-options";

interface DesktopControlsProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: string;
  setActivePanelAction: (panel: string) => void;
}

export function DesktopControls({
  currentLesson,
  currentFragment,
  fragmentIndex,
  activePanel,
  setActivePanelAction,
}: DesktopControlsProps) {
  const [isCasting, setIsCasting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen)
        (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen)
        (elem as any).msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen)
        (document as any).webkitExitFullscreen();
      else if ((document as any).msExitFullscreen)
        (document as any).msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const startCasting = async () => {
    try {
      if ("presentation" in navigator) {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        const request = new (window as any).PresentationRequest([
          presentationUrl,
        ]);
        const connection = await request.start();
        setIsCasting(true);
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
    <div className="flex items-center space-x-1 md:space-x-2">
      <div className="flex items-center space-x-0.5 md:space-x-1 mr-2 md:mr-4 gap-2">
        <AdminButton />

        <DesktopPanelButtons
          panelOptions={panelOptions}
          activePanel={activePanel}
          setActivePanelAction={setActivePanelAction}
        />

        <button
          className={`px-1 md:px-2 py-1 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-150 ${
            activePanel === "all"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActivePanelAction("all")}
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            minHeight: 36,
            aspectRatio: "1/1",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiGrid className="w-5 h-5" />
        </button>
      </div>

      <ActionButtons
        isCasting={isCasting}
        canCast={!!currentLesson && !!currentFragment}
        canShare={!!currentLesson && !!currentFragment}
        onFullscreenAction={handleFullscreen}
        onCastAction={startCasting}
        onShareAction={shareSlide}
      />

      {showShareModal && currentLesson && currentFragment && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          lesson={currentLesson}
          fragment={currentFragment}
          fragmentIndex={fragmentIndex || 0}
        />
      )}
      <AuthButton />
    </div>
  );
}
