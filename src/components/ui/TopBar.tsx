import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Fragment, Lesson } from "../../types";
import { CompactControls } from "./top-bar/CompactControls";
import { SidebarToggle } from "./top-bar/SidebarToggle";
import { DesktopControls } from "./top-bar/DesktopControls";
import { panelOptions } from "./top-bar/panel-options";
interface TopBarProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export function TopBar({
  currentLesson,
  currentFragment,
  fragmentIndex,
  activePanel,
  setActivePanel,
}: TopBarProps) {
  // Detección de móvil client-side mínima
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <>
      {/* TopBar visible en todas las resoluciones */}
      <div className="w-full min-h-[4rem] h-12 bg-white flex items-center justify-between px-2 md:px-4 shadow-lg flex-shrink-0 z-30">
        {/* Botón hamburguesa solo en móvil */}
        {isMobile && <SidebarToggle />}

        {/* Título solo visible en desktop */}
        {!isMobile && (
          <Link
            href="/"
            className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            Líder Interactivo CMM
          </Link>
        )}

        {/* Botones de panel solo en escritorio */}
        {!isMobile && (
          <DesktopControls
            currentLesson={currentLesson}
            currentFragment={currentFragment}
            fragmentIndex={fragmentIndex}
            activePanel={activePanel}
            setActivePanelAction={setActivePanel}
          />
        )}

        {/* Botones móviles compactos - Todas las opciones */}
        {isMobile && (
          <CompactControls
            panelOptions={panelOptions}
            activePanel={activePanel}
            setActivePanelAction={setActivePanel}
            canCast={!!currentLesson && !!currentFragment}
            canShare={!!currentLesson && !!currentFragment}
          />
        )}

        {/* Modal de Compartir ahora se gestiona en DesktopControls */}
      </div>
    </>
  );
}
