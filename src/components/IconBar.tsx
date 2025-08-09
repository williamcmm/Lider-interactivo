import { FiBook, FiUser } from 'react-icons/fi';

interface IconBarProps {
  onToggleSidebar: () => void;
}

export function IconBar({ onToggleSidebar }: IconBarProps) {
  return (
    <div className="w-[60px] h-full bg-gray-200 flex flex-col justify-between items-center py-4 shadow-xl z-20 flex-shrink-0">
      {/* Contenedor del icono de la biblioteca y el botón de despliegue */}
      <div className="flex flex-col items-center space-y-4">
        {/* Botón para expandir, visible solo en desktop */}
        <button 
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-blue-500 hidden md:block flex flex-col items-center p-3"
        >
          <FiBook className="w-8 h-8 text-blue-500" />
        </button>
      </div>

      {/* Icono de perfil en la parte inferior */}
      <button className="flex items-center justify-center p-3 mt-auto bg-gray-300 rounded-full hover:bg-gray-400 transition duration-150">
        <FiUser className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
}
