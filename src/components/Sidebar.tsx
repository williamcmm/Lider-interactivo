import { useState, useEffect } from 'react';
import { FiBook, FiList } from 'react-icons/fi';
import { Seminar, Series, Lesson } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Array<(Seminar | Series) & { type: 'seminar' | 'series' }>;
  onSelectLesson: (lesson: Lesson) => void;
  isDesktop?: boolean; // Nueva prop para determinar si está en modo desktop
}

export function Sidebar({ isOpen, onClose, containers, onSelectLesson, isDesktop = false }: SidebarProps) {
  // Estado de colapsado por id
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  // Estado para detectar móvil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };

  return (
    <>
      {/* Fondo semitransparente solo para móvil */}
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <div 
        className={`
          fixed top-0 left-0 h-full w-[400px] 
          bg-gray-200 shadow-2xl p-4 flex flex-col overflow-y-auto
          transform transition-transform duration-500 ease-in-out
          ${isDesktop ? 'z-30' : 'z-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${!isDesktop && isMobile ? 'w-full' : 'w-[300px]'}
        `}
      >
        {/* Encabezado del panel lateral desplegable */}
        <div className="flex items-center pb-4 border-b border-gray-300 flex-shrink-0">
          <h2 className="text-xl font-bold whitespace-nowrap text-gray-900">Biblioteca</h2>
        </div>
      
        {/* Lista de seminarios y series */}
        <nav className="mt-4 space-y-2 flex-grow overflow-y-auto">
          {containers.map((container) => {
            const expanded = expandedIds.includes(container.id);
            return (
              <div key={container.id} className="container-item">
                <button
                  className="flex items-center w-full text-left py-2 px-3 rounded-xl bg-gray-100 mb-1 focus:outline-none"
                  onClick={() => toggleExpand(container.id)}
                >
                  {container.type === 'seminar' ? (
                    <FiBook className="w-5 h-5 mr-3 text-gray-500" />
                  ) : (
                    <FiList className="w-5 h-5 mr-3 text-gray-500" />
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="whitespace-nowrap font-medium">{container.title}</span>
                    <span className="text-xs text-gray-500">
                      {container.type === 'seminar' ? 'Seminario' : 'Serie'} • {container.lessons.length} lecciones
                    </span>
                  </div>
                  <span className="ml-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={expanded ? 'M6 12L12 6' : 'M6 6L12 12'} stroke="#555" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                {expanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {container.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className="block w-full text-left py-1.5 px-3 rounded-lg hover:bg-gray-300 transition duration-150 text-gray-800 text-sm"
                      >
                        <span className="font-medium">{lesson.order}.</span> {lesson.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex-shrink-0 mt-auto pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>Líder Interactivo CMM v1.0</p>
        </div>
      </div>
    </>
  );
}
