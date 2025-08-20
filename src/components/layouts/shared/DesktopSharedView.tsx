"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ReadingPanel } from "@/components/ReadingSection/ReadingPanel";
import { SlidePanel } from "@/components/SlideSection/SlidePanel";
import { MusicPanel } from "@/components/MusicSection/MusicPanel";
import NotesPanel from "@/components/NotesSection/NotesPanel";
import type { Lesson, Fragment, AudioFile } from "@/types";

export interface DesktopSharedViewProps {
  currentLesson: Lesson | null;
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  navigateFragmentAction: (direction: "prev" | "next") => void;
  audioFiles?: AudioFile[];
}

export default function DesktopSharedView({
  currentLesson,
  fragment,
  fragmentIndex,
  totalFragments,
  navigateFragmentAction,
  audioFiles,
}: DesktopSharedViewProps) {
  return (
    <PanelGroup direction="horizontal" className="h-full flex-1" style={{ height: "100%" }}>
      <Panel defaultSize={35} minSize={20} className="h-full">
        <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
          <ReadingPanel
            lesson={currentLesson}
            fragment={fragment}
            fragmentIndex={fragmentIndex}
            totalFragments={totalFragments}
            onNavigateFragment={navigateFragmentAction}
          />
        </div>
      </Panel>

      <PanelResizeHandle className="resize-handle-vertical bg-gray-300 w-2" />

      <Panel defaultSize={35} minSize={20} className="h-full">
        <PanelGroup direction="vertical" className="h-full flex-1" style={{ height: "100%" }}>
          <Panel defaultSize={50} minSize={20} className="h-full">
            <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
              <SlidePanel
                fragment={fragment}
                fragmentIndex={fragmentIndex}
                totalFragments={totalFragments}
                onNavigateFragment={navigateFragmentAction}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal bg-gray-300 h-2" />
          <Panel defaultSize={50} minSize={20} className="h-full">
            <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
              <MusicPanel audioFiles={audioFiles} />
            </div>
          </Panel>
        </PanelGroup>
      </Panel>

      <PanelResizeHandle className="resize-handle-vertical bg-gray-300 w-2" />

      <Panel defaultSize={30} minSize={20} className="h-full">
        <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
          <NotesPanel />
        </div>
      </Panel>
    </PanelGroup>
  );
}
