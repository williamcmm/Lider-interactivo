"use client";

import { ReadingPanel } from "@/components/ReadingSection/ReadingPanel";
import { SlidePanel } from "@/components/SlideSection/SlidePanel";
import { MusicPanel } from "@/components/MusicSection/MusicPanel";
import NotesPanel from "@/components/NotesSection/NotesPanel";
import type { Lesson, Fragment } from "@/types";

export type PanelKey = "reading" | "slides" | "music" | "notes" | "all";

export interface MobileSeparateViewProps {
  activePanel: PanelKey;
  currentLesson: Lesson | null;
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  navigateFragmentAction: (direction: "prev" | "next") => void;
  showRotateMessage: boolean;
}

export default function MobileSeparateView({
  activePanel,
  currentLesson,
  fragment,
  fragmentIndex,
  totalFragments,
  navigateFragmentAction,
  showRotateMessage,
}: MobileSeparateViewProps) {
  return (
    <div
      className="h-full w-full bg-white shadow-xl rounded-lg overflow-hidden p-2"
      style={{ paddingBottom: "80px" }}
    >
      {activePanel === "all" && showRotateMessage ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 text-blue-900 px-6 py-5 rounded-xl shadow-lg text-center max-w-xs mx-auto animate-fade-in">
            <div className="flex flex-col items-center mb-3">
              <svg
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-indigo-400 mb-2"
              >
                <rect
                  x="4"
                  y="7"
                  width="16"
                  height="10"
                  rx="2"
                  fill="#c7d2fe"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 19h8"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12 22v-3"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-semibold text-lg">Vista limitada</span>
            </div>
            <span className="block text-base">
              Gira tu celular a{" "}
              <span className="font-bold text-indigo-600">horizontal</span> y
              luego haz clic en{" "}
              <span className="font-bold text-indigo-600">
                Modo Presentador
              </span>{" "}
              para ver la lección en pantalla completa.
            </span>
            <span className="block mt-2 text-sm text-blue-700 opacity-80">
              ¡Así tendrás la mejor experiencia de estudio!
            </span>
          </div>
        </div>
      ) : (
        <>
          {activePanel === "reading" && (
            <ReadingPanel
              lesson={currentLesson}
              fragment={fragment}
              fragmentIndex={fragmentIndex}
              totalFragments={totalFragments}
              onNavigateFragment={navigateFragmentAction}
            />
          )}
          {activePanel === "slides" && (
            <SlidePanel
              fragment={fragment}
              fragmentIndex={fragmentIndex}
              totalFragments={totalFragments}
              onNavigateFragment={navigateFragmentAction}
            />
          )}
          {activePanel === "music" && <MusicPanel />}
          {activePanel === "notes" && (
            <div className="pb-24">
              <NotesPanel />
            </div>
          )}
        </>
      )}
    </div>
  );
}
