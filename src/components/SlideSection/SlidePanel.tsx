import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMonitor,
  FiVideo,
} from "react-icons/fi";
import { Fragment } from "@/types";
import { defaultSlideHtml } from "@/constants/defaultContent";

interface SlidePanelProps {
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  onNavigateFragment: (direction: "prev" | "next") => void;
}

export function SlidePanel({
  fragment,
  fragmentIndex,
  totalFragments,
  onNavigateFragment,
}: SlidePanelProps) {
  const [currentMode, setCurrentMode] = useState<"slides" | "videos">("slides");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Resetear índices cuando cambie el fragmento
  const resetIndexes = () => {
    setCurrentSlideIndex(0);
    setCurrentVideoIndex(0);
  };

  // Efecto para resetear cuando cambie el fragmento
  React.useEffect(() => {
    resetIndexes();
  }, [fragment?.id]);

  const getCurrentSlide = () => {
    if (!fragment || !fragment.slides || fragment.slides.length === 0) {
      return { content: defaultSlideHtml, title: "Diapositiva por defecto" };
    }
    const slide = fragment.slides[currentSlideIndex];
    return (
      slide || { content: defaultSlideHtml, title: "Diapositiva por defecto" }
    );
  };

  const getCurrentVideo = () => {
    if (!fragment || !fragment.videos || fragment.videos.length === 0) {
      return null;
    }
    return fragment.videos[currentVideoIndex];
  };

  const getSlideContent = () => {
    if (currentMode === "videos") {
      const video = getCurrentVideo();
      if (video) {
        return (
          <div className="w-full flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-4xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg"
              ></iframe>
            </div>

            <div className="text-center max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-700 mb-6">
              � Sin videos
            </h3>
            <p className="text-xl text-gray-600 mb-4">
              No hay videos disponibles para este fragmento
            </p>
          </div>
        );
      }
    } else {
      const slide = getCurrentSlide();
      return (
        <div className="w-full h-full py-10">
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: slide.content }}
          />
        </div>
      );
    }
  };

  const hasSlides = fragment && fragment.slides && fragment.slides.length > 0;
  const hasVideos = fragment && fragment.videos && fragment.videos.length > 0;
  const totalSlides = hasSlides ? fragment!.slides!.length : 0;
  const totalVideos = hasVideos ? fragment!.videos!.length : 0;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Presentación</h2>
        {fragment && totalFragments > 0 && (
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Fragmento {fragment.order} de {totalFragments}
          </div>
        )}
      </div>

      {/* Controles de modo */}
      <div className="mb-4 space-y-3">
        {/* Selector de modo */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentMode("slides")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              currentMode === "slides"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <FiMonitor className="w-4 h-4" />
            <span>Diapositivas</span>
          </button>
          <button
            onClick={() => setCurrentMode("videos")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              currentMode === "videos"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <FiVideo className="w-4 h-4" />
            <span>Videos</span>
          </button>
        </div>
      </div>

      {/* Contenido de la diapositiva/video */}
      <div className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-inner relative min-h-0 border border-blue-200 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-white/80 to-blue-50/80 rounded-lg overflow-auto">
          <div className="w-full h-full p-4">
            <div className="w-full h-auto min-h-full">{getSlideContent()}</div>
          </div>
          
          {/* Controles de contenido - Posición fija en la parte inferior */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white/95 to-transparent p-4 pt-2">
            {currentMode === "slides" && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))
                  }
                  disabled={currentSlideIndex === 0}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium bg-white px-3 py-1 rounded-full shadow">
                  Diapositiva {currentSlideIndex + 1} de {totalSlides}
                </span>
                <button
                  onClick={() =>
                    setCurrentSlideIndex(
                      Math.min(totalSlides - 1, currentSlideIndex + 1)
                    )
                  }
                  disabled={currentSlideIndex === totalSlides - 1}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentMode === "videos" && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))
                  }
                  disabled={currentVideoIndex === 0}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium bg-white px-3 py-1 rounded-full shadow">
                  Video {currentVideoIndex + 1} de {totalVideos}
                </span>
                <button
                  onClick={() =>
                    setCurrentVideoIndex(
                      Math.min(totalVideos - 1, currentVideoIndex + 1)
                    )
                  }
                  disabled={currentVideoIndex === totalVideos - 1}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de fragmentos - CONTROLES PRINCIPALES */}
      <div className="flex justify-center items-center gap-2 mt-5">
        <button
          onClick={() => onNavigateFragment("prev")}
          disabled={fragmentIndex === 0}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full shadow transition-all transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:transform-none border border-gray-300"
          title="Fragmento anterior"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-gray-500 font-semibold text-xs bg-gray-100 px-2 py-1 rounded-full border">
          Fragmento {fragmentIndex + 1} de {totalFragments}
        </div>
        <button
          onClick={() => onNavigateFragment("next")}
          disabled={fragmentIndex === totalFragments - 1}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full shadow transition-all transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:transform-none border border-gray-300"
          title="Fragmento siguiente"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
