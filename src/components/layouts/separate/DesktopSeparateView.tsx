"use client";

import { ReadingPanel } from "@/components/ReadingSection/ReadingPanel";
import { SlidePanel } from "@/components/SlideSection/SlidePanel";
import { MusicPanel } from "@/components/MusicSection/MusicPanel";
import NotesPanel from "@/components/NotesSection/NotesPanel";
import type { Lesson, Fragment } from "@/types";

export type PanelKey = "reading" | "slides" | "music" | "notes";

export interface DesktopSeparateViewProps {
  activePanel: PanelKey;
  currentLesson: Lesson | null;
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  navigateFragmentAction: (direction: "prev" | "next") => void;
}

export default function DesktopSeparateView({
  activePanel,
  currentLesson,
  fragment,
  fragmentIndex,
  totalFragments,
  navigateFragmentAction,
}: DesktopSeparateViewProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      {activePanel === "reading" && (
        <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
          <ReadingPanel
            lesson={currentLesson}
            fragment={fragment}
            fragmentIndex={fragmentIndex}
            totalFragments={totalFragments}
            onNavigateFragment={navigateFragmentAction}
          />
        </div>
      )}
      {activePanel === "slides" && (
        <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
          <SlidePanel
            fragment={fragment}
            fragmentIndex={fragmentIndex}
            totalFragments={totalFragments}
            onNavigateFragment={navigateFragmentAction}
          />
        </div>
      )}
      {activePanel === "music" && (
        <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
          <MusicPanel />
        </div>
      )}
      {activePanel === "notes" && (
        <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden pb-24">
          <NotesPanel />
        </div>
      )}
    </div>
  );
}
