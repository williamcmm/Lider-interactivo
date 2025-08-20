"use client";

import { Fragment, Lesson } from "@/types";
import { useState, useEffect } from "react";
import { FiPlay, FiShare2 } from "react-icons/fi";
import { TbCast } from "react-icons/tb";
import { ShareModal } from "../ShareModal";

interface ActionButtonsMobileProps {
  canCast: boolean;
  canShare: boolean;
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
}

export function ActionButtonsMobile({
  canCast,
  canShare,
  currentLesson,
  currentFragment,
  fragmentIndex,
}: ActionButtonsMobileProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Sincronizar estado de fullscreen con eventos del navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
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
    <>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition duration-150"
          onClick={handleFullscreen}
        >
          <FiPlay className="w-4 h-4" />
        </button>

        <button
          onClick={startCasting}
          disabled={!canCast}
          className={`p-1.5 rounded-full flex items-center justify-center text-white transition duration-150 ${
            isCasting
              ? "bg-green-500 hover:bg-green-600"
              : canCast
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <TbCast className="w-4 h-4" />
        </button>

        <button
          onClick={shareSlide}
          disabled={!canShare}
          className={`p-1.5 rounded-full flex items-center justify-center text-white transition duration-150 ${
            canShare
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      </div>

      {showShareModal && currentLesson && currentFragment && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          lesson={currentLesson}
          fragment={currentFragment}
          fragmentIndex={fragmentIndex || 0}
        />
      )}
    </>
  );
}
