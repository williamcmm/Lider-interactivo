import { FiBookOpen, FiEdit, FiMonitor, FiMusic } from "react-icons/fi";

export type PanelKey = "all" | "reading" | "slides" | "music" | "notes";
export type PanelTabKey = Exclude<PanelKey, "all">;

export const panelOptions: { key: PanelTabKey; icon: React.ReactNode }[] = [
  { key: "reading", icon: <FiBookOpen className="w-5 h-5" /> },
  { key: "slides", icon: <FiMonitor className="w-5 h-5" /> },
  { key: "music", icon: <FiMusic className="w-5 h-5" /> },
  { key: "notes", icon: <FiEdit className="w-5 h-5" /> },
];
