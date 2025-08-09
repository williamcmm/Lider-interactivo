'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson, Fragment } from '@/types';
import { LocalStorage } from '@/lib/storage';

export default function SharedSlidePage() {
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [currentFragment, setCurrentFragment] = useState<Fragment | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    const fragmentIndex = parseInt(searchParams.get('fragment') || '0');

    if (lessonId) {
      // Buscar la lección en seminarios y series
      const seminars = LocalStorage.getSeminars();
      const series = LocalStorage.getSeries();
      
      let foundLesson = null;
      
      // Buscar en seminarios
      for (const seminar of seminars) {
        foundLesson = seminar.lessons.find(l => l.id === lessonId);
        if (foundLesson) break;
      }
      
      // Buscar en series si no se encontró en seminarios
      if (!foundLesson) {
        for (const serie of series) {
          foundLesson = serie.lessons.find(l => l.id === lessonId);
          if (foundLesson) break;
        }
      }

      if (foundLesson) {
        setLesson(foundLesson);
        setCurrentFragmentIndex(fragmentIndex);
        setCurrentFragment(foundLesson.fragments[fragmentIndex] || null);
        setIsConnected(true);
      }
    }
  }, [searchParams]);

  // Simular actualizaciones en tiempo real (en una implementación real usarías WebSockets)
  useEffect(() => {
    if (!lesson) return;

    const pollForUpdates = setInterval(() => {
      // En una implementación real, consultarías un servidor para actualizaciones
      // Por ahora, mantenemos el fragmento inicial
    }, 5000);

    return () => clearInterval(pollForUpdates);
  }, [lesson]);

  if (!lesson || !currentFragment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cargando...</h1>
          <p className="text-gray-600">Conectando con la presentación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header compacto */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{lesson.title}</h1>
              <p className="text-gray-300 text-sm">Fragmento {currentFragmentIndex + 1} de {lesson.fragments.length}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-300">
                {isConnected ? 'En vivo' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SOLO LA DIAPOSITIVA - Pantalla completa */}
      <div className="h-screen bg-white mx-4 my-4 rounded-lg shadow-2xl overflow-hidden" style={{height: 'calc(100vh - 120px)'}}>
        {currentFragment.slide ? (
          <div 
            className="w-full h-full p-8 flex items-center justify-center text-center"
            dangerouslySetInnerHTML={{ __html: currentFragment.slide }}
          />
        ) : (
          <div className="w-full h-full p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">{lesson.title}</h2>
              <h3 className="text-2xl text-gray-600 mb-4">Fragmento {currentFragment.order}</h3>
              <p className="text-lg text-gray-500">Esperando contenido de diapositiva...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer minimalista */}
      <div className="bg-gray-900 text-gray-400 text-center py-2">
        <p className="text-xs">Líder Interactivo CMM • Vista de Diapositiva</p>
      </div>
    </div>
  );
}
