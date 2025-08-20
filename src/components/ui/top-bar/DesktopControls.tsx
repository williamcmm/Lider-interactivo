"use client";

import React, { useState, useEffect } from "react";
import { FiGrid } from "react-icons/fi";
import { Fragment, Lesson } from "@/types";
import { AuthButton } from "./AuthButton";
import { submitAlert } from "@/utils/alerts";
import { AdminButton } from "./AdminButton";
import { DesktopPanelButtons } from "./DesktopPanelButtons";
import { ActionButtons } from "./ActionButtons";
import { ShareModal } from "../ShareModal";
import { panelOptions, PanelKey } from "./panel-options";

interface DesktopControlsProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: PanelKey;
  setActivePanelAction: (panel: PanelKey) => void;
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
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ('webkitRequestFullscreen' in elem) {
        (elem as HTMLElement & { webkitRequestFullscreen(): void }).webkitRequestFullscreen();
      } else if ('msRequestFullscreen' in elem) {
        (elem as HTMLElement & { msRequestFullscreen(): void }).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        (document as Document & { webkitExitFullscreen(): void }).webkitExitFullscreen();
      } else if ('msExitFullscreen' in document) {
        (document as Document & { msExitFullscreen(): void }).msExitFullscreen();
      }
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
        
        // Type assertion más simple para PresentationRequest
        const PresentationRequestConstructor = (window as unknown as {
          PresentationRequest: new (urls: string[]) => {
            start(): Promise<{ send(data: string): void }>;
          };
        }).PresentationRequest;
        
        const request = new PresentationRequestConstructor([presentationUrl]);
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
      submitAlert(
        "No se pudo conectar a una pantalla externa. Asegúrate de que haya dispositivos compatibles disponibles.",
        "error"
      );
    }
  };

  const shareSlide = () => {
    if (!currentLesson || !currentFragment) {
      submitAlert("No hay una lección o fragmento seleccionado para compartir.", "warning");
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
          className={`w-9 h-9 min-w-[36px] min-h-[36px] aspect-square p-0 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-150 ${
            activePanel === "all"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActivePanelAction("all")}
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
