import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

export interface MenuMobileButtonsProps {
  buttons: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
}

const MenuMobileButtons: React.FC<MenuMobileButtonsProps> = ({ buttons }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
        aria-label="Más acciones"
        onClick={() => setOpen((v) => !v)}
      >
        <FiMoreVertical size={24} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50"
              onClick={() => {
                btn.onClick();
                setOpen(false);
              }}
              disabled={btn.disabled}
            >
              <span className="mr-2">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuMobileButtons;
