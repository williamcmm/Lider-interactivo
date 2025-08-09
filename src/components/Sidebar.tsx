import { useState } from 'react';
import { FiChevronLeft, FiBook, FiList } from 'react-icons/fi';
import { Seminar, Series, Lesson } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Array<(Seminar | Series) & { type: 'seminar' | 'series' }>;
  onSelectLesson: (lesson: Lesson) => void;
}

export function Sidebar({ isOpen, onClose, containers, onSelectLesson }: SidebarProps) {
  const [expandedContainer, setExpandedContainer] = useState<string | null>(null);

  const toggleContainer = (containerId: string) => {
    setExpandedContainer(expandedContainer === containerId ? null : containerId);
  };

  return (
    <div 
      className={`absolute top-0 left-[60px] h-full w-[300px] bg-gray-200 transform transition-transform duration-300 ease-in-out z-10 p-4 flex flex-col overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Encabezado del panel lateral desplegable */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-300 flex-shrink-0">
        <h2 className="text-xl font-bold whitespace-nowrap text-gray-900">Biblioteca</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
          <FiChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      {/* Lista de seminarios y series */}
      <nav className="mt-4 space-y-2 flex-grow overflow-y-auto">
        {containers.map((container) => (
          <div key={container.id} className="container-item">
            <button 
              onClick={() => toggleContainer(container.id)}
              className="flex items-center w-full text-left py-2 px-3 rounded-xl hover:bg-gray-300 transition duration-150 group text-gray-800"
            >
              {container.type === 'seminar' ? (
                <FiBook className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-500" />
              ) : (
                <FiList className="w-5 h-5 mr-3 text-gray-500 group-hover:text-green-500" />
              )}
              <div className="flex flex-col">
                <span className="whitespace-nowrap font-medium">{container.title}</span>
                <span className="text-xs text-gray-500">
                  {container.type === 'seminar' ? 'Seminario' : 'Serie'} • {container.lessons.length} lecciones
                </span>
              </div>
            </button>
            
            {expandedContainer === container.id && (
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
        ))}
      </nav>
      
      <div className="flex-shrink-0 mt-auto pt-4 border-t border-gray-300 text-xs text-gray-500">
        <p>Líder Interactivo CMM v1.0</p>
      </div>
    </div>
  );
}
