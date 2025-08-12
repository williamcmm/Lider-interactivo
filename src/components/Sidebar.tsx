import { useState, useEffect, useRef } from 'react';
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

  // Componente para texto con marquesina
  const MarqueeText = ({ text, className = "" }: { text: string; className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
      const checkOverflow = () => {
        if (containerRef.current && textRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const textWidth = textRef.current.scrollWidth;
          setShouldAnimate(textWidth > containerWidth);
        }
      };

      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    return (
      <div ref={containerRef} className={`overflow-hidden ${className}`}>
        <span 
          ref={textRef}
          className={`block whitespace-nowrap ${
            shouldAnimate 
              ? 'animate-marquee hover:animation-paused' 
              : ''
          }`}
        >
          {text}
        </span>
      </div>
    );
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
                  className="flex items-center w-full text-left py-2 px-3 rounded-xl bg-gray-100 mb-1 focus:outline-none hover:bg-gray-200 transition-colors duration-150"
                  onClick={() => toggleExpand(container.id)}
                >
                  {/* Icono con ancho fijo */}
                  <div className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center">
                    {container.type === 'seminar' ? (
                      <FiBook className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FiList className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  
                  {/* Contenido de texto con marquesina */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <MarqueeText 
                      text={container.title} 
                      className="font-medium text-gray-900" 
                    />
                    <MarqueeText 
                      text={`${container.type === 'seminar' ? 'Seminario' : 'Serie'} • ${container.lessons.length} lecciones`}
                      className="text-xs text-gray-500 mt-0.5"
                    />
                  </div>
                  
                  {/* Icono de expansión con ancho fijo */}
                  <div className="w-6 h-6 ml-2 flex-shrink-0 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={expanded ? 'M6 12L12 6' : 'M6 6L12 12'} stroke="#555" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>
                {expanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {container.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className="flex items-center w-full text-left py-1.5 px-3 rounded-lg hover:bg-gray-300 transition duration-150 text-gray-800 text-sm group"
                      >
                        {/* Número de orden con ancho fijo */}
                        <span className="font-medium mr-2 flex-shrink-0 w-6 text-gray-600">
                          {lesson.order}.
                        </span>
                        
                        {/* Título de la lección con marquesina */}
                        <div className="flex-1 min-w-0">
                          <MarqueeText 
                            text={lesson.title}
                            className="text-gray-800 group-hover:text-gray-900"
                          />
                        </div>
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
