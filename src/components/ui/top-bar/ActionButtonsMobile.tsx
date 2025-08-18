"use client";

import { FiPlay, FiShare2 } from "react-icons/fi";
import { TbCast } from "react-icons/tb";

interface ActionButtonsMobileProps {
  isCasting: boolean;
  canCast: boolean;
  canShare: boolean;
  onFullscreenAction: () => void;
  onCastAction: () => void;
  onShareAction: () => void;
}

export function ActionButtonsMobile({
  isCasting,
  canCast,
  canShare,
  onFullscreenAction,
  onCastAction,
  onShareAction,
}: ActionButtonsMobileProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="p-1.5 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition duration-150"
        onClick={onFullscreenAction}
      >
        <FiPlay className="w-4 h-4" />
      </button>

      <button
        onClick={onCastAction}
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
        onClick={onShareAction}
        disabled={!canShare}
        className={`p-1.5 rounded-full flex items-center justify-center text-white transition duration-150 ${
          canShare ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <FiShare2 className="w-4 h-4" />
      </button>
    </div>
  );
}
