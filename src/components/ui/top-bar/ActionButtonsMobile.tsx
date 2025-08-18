"use client";

import { Fragment, Lesson } from "@/types";
import { useState } from "react";
import { FiPlay, FiShare2 } from "react-icons/fi";
import { TbCast } from "react-icons/tb";

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
  );
}
