"use client";

import { FiPlay, FiShare2 } from "react-icons/fi";
import { TbCast } from "react-icons/tb";

interface ActionButtonsProps {
  isCasting: boolean;
  canCast: boolean;
  canShare: boolean;
  onFullscreenAction: () => void;
  onCastAction: () => void;
  onShareAction: () => void;
  compact?: boolean; // mobile
}

export function ActionButtons({
  isCasting,
  canCast,
  canShare,
  onFullscreenAction,
  onCastAction,
  onShareAction,
  compact = false,
}: ActionButtonsProps) {
  if (compact) {
    return (
      <>
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
            canShare
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      </>
    );
  }

  return (
    <>
      <button
        className="m-1 w-12 h-12 min-w-[48px] min-h-[48px] aspect-square p-0 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition duration-150"
        onClick={onFullscreenAction}
      >
        <FiPlay className="w-5 h-5" />
      </button>

      <button
        onClick={onCastAction}
        disabled={!canCast}
        className={`m-1 w-12 h-12 min-w-[48px] min-h-[48px] aspect-square p-0 rounded-full flex items-center justify-center text-white transition duration-150 ${
          isCasting
            ? "bg-green-500 hover:bg-green-600"
            : canCast
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <TbCast className="w-5 h-5" />
      </button>

      <button
        onClick={onShareAction}
        disabled={!canShare}
        className={`m-1 w-12 h-12 min-w-[48px] min-h-[48px] aspect-square p-0 rounded-full flex items-center justify-center text-white transition duration-150 ${
          canShare
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <FiShare2 className="w-5 h-5" />
      </button>
    </>
  );
}
