import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Fragment } from '@/types';

interface SlidePanelProps {
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  onNavigateFragment: (direction: 'prev' | 'next') => void;
}

export function SlidePanel({ fragment, fragmentIndex, totalFragments, onNavigateFragment }: SlidePanelProps) {
  const getSlideContent = () => {
    if (fragment && fragment.slide && fragment.slide.trim()) {
      return <div className="prose prose-lg max-w-none text-center" dangerouslySetInnerHTML={{ __html: fragment.slide }} />;
    }
    
    // Contenido por defecto
    return (
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-700 mb-6">📖 Aplicación de Estudio</h3>
        <p className="text-xl text-gray-600 mb-4">Seleccione una lección para comenzar</p>
        <p className="text-gray-500">Use los controles ◀️ ▶️ para navegar entre fragmentos</p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Presentación</h2>
        {fragment && totalFragments > 0 && (
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Fragmento {fragment.order} de {totalFragments}
          </div>
        )}
      </div>

      {/* Contenido de la diapositiva */}
      <div className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-inner relative min-h-0 border border-blue-200">
      <div className="w-full h-full max-h-full bg-gradient-to-br from-white/80 to-blue-50/80 rounded-lg flex items-center justify-center overflow-auto">
          <div className="w-full h-full p-8 flex items-center justify-center">
            <div className="text-center max-w-4xl">
              {getSlideContent()}
            </div>
          </div>
        </div>
        
        {/* Navegación de fragmentos - CONTROLES PRINCIPALES */}
        {totalFragments > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-6 z-10">
            <button 
              onClick={() => onNavigateFragment('prev')}
              disabled={fragmentIndex === 0}
              className="bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:transform-none border-2 border-gray-300"
              title="Fragmento anterior"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-gray-800 font-bold text-lg">
              Fragmento {fragmentIndex + 1} de {totalFragments}
            </div>
            
            <button 
              onClick={() => onNavigateFragment('next')}
              disabled={fragmentIndex === totalFragments - 1}
              className="bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:transform-none border-2 border-gray-300"
              title="Fragmento siguiente"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
