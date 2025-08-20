"use client";

import React from "react";
import type { PanelKey } from "./panel-options";

interface DesktopPanelButtonsProps {
  panelOptions: { key: Exclude<PanelKey, "all">; icon: React.ReactNode }[];
  activePanel: PanelKey;
  setActivePanelAction: (panel: PanelKey) => void;
}

export function DesktopPanelButtons({ panelOptions, activePanel, setActivePanelAction }: DesktopPanelButtonsProps) {
  return (
    <>
      {panelOptions.map((panel) => (
        <button
          key={panel.key}
          className={`px-1 md:px-2 py-1 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-150 ${
            activePanel === panel.key ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActivePanelAction(panel.key)}
          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, aspectRatio: "1/1", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {panel.icon}
        </button>
      ))}
    </>
  );
}
