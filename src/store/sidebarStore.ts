import { create } from 'zustand';

interface SidebarState {
  // Estados del sidebar
  isSidebarOpen: boolean;
  isMobile: boolean;
  
  // Acciones
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // Estado inicial
  isSidebarOpen: false,
  isMobile: false,

  // Acciones básicas
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  toggleSidebar: () => {
    const { isSidebarOpen } = get();
    set({ isSidebarOpen: !isSidebarOpen });
  },

  setIsMobile: (mobile: boolean) => {
    const { isSidebarOpen } = get();
    set({ isMobile: mobile });
    
    // Si cambia a desktop y el sidebar está abierto en móvil, cerrarlo
    if (!mobile && isSidebarOpen) {
      set({ isSidebarOpen: false });
    }
  }
}));
