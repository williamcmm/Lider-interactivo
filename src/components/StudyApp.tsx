"use client";

import { useState, useEffect, useMemo } from "react";
import { TopBar } from "./ui/TopBar";
import { Sidebar } from "./ui/Sidebar";
import DesktopSharedView from "./layouts/shared/DesktopSharedView";
import MobileSharedView from "./layouts/shared/MobileSharedView";
import DesktopSeparateView from "./layouts/separate/DesktopSeparateView";
import MobileSeparateView from "./layouts/separate/MobileSeparateView";
// ...existing code...
import { Seminar, Series, Lesson, Fragment } from "@/types";
import type { DbSeminar, DbSeries } from "@/types/db";
import { dbSeminarToUi, dbSeriesToUi } from "@/types/db";
// Eliminado LocalStorage fallback
import { useSidebarStore } from "@/store/sidebarStore";
import { useNotesStore } from "@/store/notesStore";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type StudyAppProps = {
  initialSeminars?: DbSeminar[];
  initialSeries?: DbSeries[];
};

export function StudyApp({ initialSeminars = [], initialSeries = [] }: StudyAppProps) {
  // Zustand store para sidebar
  const { isSidebarOpen, isMobile, closeSidebar, toggleSidebar, setIsMobile } =
    useSidebarStore();

  // Zustand store para notas - inicializar en el componente principal
  const { setSharedUsers } = useNotesStore();

  // Panel por defecto: 'all' en escritorio/tablet, 'reading' en móvil vertical
  const [activePanel, setActivePanel] = useState<
    "all" | "reading" | "slides" | "music" | "notes"
  >("all");
  // Estado para mostrar aviso en móvil vertical en 'Ver todo'
  const [showRotateMessage, setShowRotateMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (activePanel === "all" && window.innerHeight > window.innerWidth) {
        setShowRotateMessage(true);
      } else {
        setShowRotateMessage(false);
      }
    } else {
      setShowRotateMessage(false);
    }
  }, [activePanel]);
  // Estados para la aplicación principal

  // Inicializar detección de móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  // Forzar re-render cuando cambia la orientación del dispositivo
  const [, forceRender] = useState({});
  useEffect(() => {
    const handleOrientationChange = () => {
      // Forzar re-render para que se reevalúen las condiciones de orientación
      forceRender({});
    };
    
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Detectar si es móvil para mostrar hamburguesa
  // Removido porque ahora usamos Zustand
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  
  // Convertir datos iniciales a UI types usando useMemo (no cambian después de inicialización)
  const seminars = useMemo<Seminar[]>(
    () => (initialSeminars ?? []).map(dbSeminarToUi),
    [initialSeminars]
  );
  const series = useMemo<Series[]>(
    () => (initialSeries ?? []).map(dbSeriesToUi),
    [initialSeries]
  );

  useEffect(() => {
    const setInitialPanel = () => {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setActivePanel("reading");
      } else {
        setActivePanel("all");
      }
    };
    setInitialPanel();
    window.addEventListener("resize", setInitialPanel);
    window.addEventListener("orientationchange", setInitialPanel);
    return () => {
      window.removeEventListener("resize", setInitialPanel);
      window.removeEventListener("orientationchange", setInitialPanel);
    };
  }, []);

  // Variables derivadas
  const fragment =
    currentLesson?.fragments && currentLesson.fragments.length > 0
      ? (currentLesson.fragments[currentFragmentIndex] as Fragment)
      : null;
  const totalFragments = currentLesson?.fragments
    ? currentLesson.fragments.length
    : 0;

  // Cargar datos iniciales desde props
  useEffect(() => {
    // Inicializar usuarios compartidos en el store
    setSharedUsers(["usuario1@email.com", "usuario2@email.com"]);
    // Seleccionar la primera lección disponible de datos del servidor
    if (seminars.length > 0 && seminars[0].lessons.length > 0) {
      setCurrentLesson(seminars[0].lessons[0]);
    } else if (series.length > 0 && series[0].lessons.length > 0) {
      setCurrentLesson(series[0].lessons[0]);
    } else {
      setCurrentLesson(null);
    }
  }, [setSharedUsers, seminars, series]);

  // Combinar seminarios y series para la navegación (memoizado)
  const allContainers = useMemo(
    () =>
      [
        ...seminars.map((s) => ({ ...s, type: "seminar" as const })),
        ...series.map((s) => ({ ...s, type: "series" as const })),
      ].sort((a, b) => a.order - b.order),
    [seminars, series]
  );

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentFragmentIndex(0); // Resetear al primer fragmento
    // Cerrar sidebar en móvil después de seleccionar
    if (isMobile) {
      closeSidebar();
    }
  };

  // Navegación de fragmentos sin sincronización remota
  const navigateToFragment = (direction: "prev" | "next") => {
    if (!currentLesson || !currentLesson.fragments.length) return;
    const newIndex =
      direction === "next"
        ? Math.min(currentFragmentIndex + 1, currentLesson.fragments.length - 1)
        : Math.max(currentFragmentIndex - 1, 0);
    setCurrentFragmentIndex(newIndex);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Barra Superior */}
      <TopBar
        currentLesson={currentLesson}
        currentFragment={fragment}
        fragmentIndex={currentFragmentIndex}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      {/* Sidebar siempre visible en escritorio, hamburguesa en móvil */}
      <div className="flex-1 h-full min-h-0 flex overflow-hidden">
        {/* Botón de toggle para desktop - siempre visible */}
        {!isMobile && (
          <button
            className={`fixed top-16 left-0 z-40 bg-gray-300 hover:bg-gray-400 rounded-r-full p-1 shadow transition-all duration-500 ease-in-out ${
              isSidebarOpen ? "translate-x-[400px]" : "translate-x-0"
            }`}
            style={{ width: 32, height: 58 }}
            onClick={toggleSidebar}
            aria-label={
              isSidebarOpen ? "Cerrar biblioteca" : "Abrir biblioteca"
            }
          >
            {isSidebarOpen ? (
              <FiChevronLeft size={25} />
            ) : (
              <FiChevronRight size={25} />
            )}
          </button>
        )}

        {/* Sidebar desktop - overlay */}
        {!isMobile && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            containers={allContainers}
            onSelectLesson={selectLesson}
            isDesktop={true}
          />
        )}

        {/* Sidebar móvil solo se abre desde el botón hamburguesa */}
        {isMobile && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            containers={allContainers}
            onSelectLesson={selectLesson}
            isDesktop={false}
          />
        )}

        {/* Paneles principales: NAVEGACIÓN POR PESTAÑAS EN MÓVIL */}
        <div className="flex-1 h-full min-h-0 p-2 overflow-hidden">
          {/* --- Alternancia: mobile vertical usa vista separada; resto usa shared/all o separadas --- */}
          {isMobile && window.innerHeight > window.innerWidth ? (
            <MobileSeparateView
              activePanel={activePanel}
              currentLesson={currentLesson}
              fragment={fragment}
              fragmentIndex={currentFragmentIndex}
              totalFragments={totalFragments}
              navigateFragmentAction={navigateToFragment}
              showRotateMessage={showRotateMessage}
            />
          ) : activePanel === "all" ? (
            isMobile ? (
              <MobileSharedView
                currentLesson={currentLesson}
                fragment={fragment}
                fragmentIndex={currentFragmentIndex}
                totalFragments={totalFragments}
                navigateFragmentAction={navigateToFragment}
              />
            ) : (
              <DesktopSharedView
                currentLesson={currentLesson}
                fragment={fragment}
                fragmentIndex={currentFragmentIndex}
                totalFragments={totalFragments}
                navigateFragmentAction={navigateToFragment}
              />
            )
          ) : isMobile ? (
            <MobileSeparateView
              activePanel={activePanel}
              currentLesson={currentLesson}
              fragment={fragment}
              fragmentIndex={currentFragmentIndex}
              totalFragments={totalFragments}
              navigateFragmentAction={navigateToFragment}
              showRotateMessage={showRotateMessage}
            />
          ) : (
            <DesktopSeparateView
              activePanel={activePanel}
              currentLesson={currentLesson}
              fragment={fragment}
              fragmentIndex={currentFragmentIndex}
              totalFragments={totalFragments}
              navigateFragmentAction={navigateToFragment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
