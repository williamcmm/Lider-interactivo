"use client";

import { useState, useEffect } from "react";
import { TopBar } from "./ui/TopBar";
import { Sidebar } from "./ui/Sidebar";
import DesktopSharedView from "./layouts/shared/DesktopSharedView";
import MobileSharedView from "./layouts/shared/MobileSharedView";
import DesktopSeparateView from "./layouts/separate/DesktopSeparateView";
import MobileSeparateView from "./layouts/separate/MobileSeparateView";
// ...existing code...
import { Seminar, Series, Lesson, Fragment } from "@/types";
import { LocalStorageManager } from "@/lib/storage";
import { useSidebarStore } from "@/store/sidebarStore";
import { useNotesStore } from "@/store/notesStore";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function StudyApp() {
  // Zustand store para sidebar
  const { isSidebarOpen, isMobile, closeSidebar, toggleSidebar, setIsMobile } =
    useSidebarStore();

  // Zustand store para notas - inicializar en el componente principal
  const { setSharedUsers } = useNotesStore();

  // Panel por defecto: 'all' en escritorio/tablet, 'reading' en móvil vertical
  const [activePanel, setActivePanel] = useState<string>("all");
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

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);
  // Detectar si es móvil para mostrar hamburguesa
  // Removido porque ahora usamos Zustand
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

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

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    // Inicializar usuarios compartidos en el store
    setSharedUsers(["usuario1@email.com", "usuario2@email.com"]);

    // Cargar datos desde localStorage (solo si existen)
    const storedSeminars = LocalStorageManager.getSeminars();
    const storedSeries = LocalStorageManager.getSeries();

    setSeminars(storedSeminars);
    setSeries(storedSeries);

    // Seleccionar la primera lección disponible por defecto (solo si hay datos)
    if (storedSeminars.length > 0 && storedSeminars[0].lessons.length > 0) {
      setCurrentLesson(storedSeminars[0].lessons[0]);
    } else if (storedSeries.length > 0 && storedSeries[0].lessons.length > 0) {
      setCurrentLesson(storedSeries[0].lessons[0]);
    } else {
      // No hay datos, mantener currentLesson como null
      setCurrentLesson(null);
    }
  }, [setSharedUsers]);

  // Combinar seminarios y series para la navegación
  const allContainers = [
    ...seminars.map((s) => ({ ...s, type: "seminar" as const })),
    ...series.map((s) => ({ ...s, type: "series" as const })),
  ].sort((a, b) => a.order - b.order);

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
              activePanel={activePanel as any}
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
              activePanel={activePanel as any}
              currentLesson={currentLesson}
              fragment={fragment}
              fragmentIndex={currentFragmentIndex}
              totalFragments={totalFragments}
              navigateFragmentAction={navigateToFragment}
              showRotateMessage={showRotateMessage}
            />
          ) : (
            <DesktopSeparateView
              activePanel={activePanel as any}
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
