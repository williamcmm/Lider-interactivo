'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson, Fragment } from '@/types';
import { LocalStorage } from '@/lib/storage';

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [currentFragment, setCurrentFragment] = useState<Fragment | null>(null);

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
      }
    }
  }, [searchParams]);

  // Escuchar mensajes de la ventana principal para actualizar la diapositiva
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'update-slide') {
        setCurrentFragmentIndex(event.data.fragmentIndex);
        if (lesson && lesson.fragments[event.data.fragmentIndex]) {
          setCurrentFragment(lesson.fragments[event.data.fragmentIndex]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lesson]);

  if (!lesson || !currentFragment) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Esperando contenido...</h1>
          <p className="text-xl">Conectando con la presentación principal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col text-white overflow-hidden">
      {/* Header con información de la lección */}
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="text-lg">
          Fragmento {currentFragmentIndex + 1} de {lesson.fragments.length}
        </div>
      </div>

      {/* Contenido de la diapositiva */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-full bg-white text-black rounded-lg shadow-2xl overflow-hidden">
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
                <div className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  {currentFragment.readingMaterial ? (
                    <div dangerouslySetInnerHTML={{ __html: currentFragment.readingMaterial }} />
                  ) : (
                    <p>Material de estudio en progreso...</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con controles básicos */}
      <div className="bg-gray-900 p-2 text-center text-sm">
        Presentación • Líder Interactivo CMM
      </div>
    </div>
  );
}
