'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson, Fragment } from '@/types';
import { LocalStorage } from '@/lib/storage';
// import { realtimeDb } from '@/lib/firebase';
// import { ref, onValue } from 'firebase/database';

export default function SharedSlidePage() {
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [currentFragment, setCurrentFragment] = useState<Fragment | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [showSlide, setShowSlide] = useState(false);
  const [showAids, setShowAids] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    const fragmentIndex = parseInt(searchParams.get('fragment') || '0');
    const typeParam = searchParams.get('type') || '';
    const types = typeParam.split(',');
    setShowReading(types.includes('reading'));
    setShowSlide(types.includes('slide'));
    setShowAids(types.includes('aids'));
    setShowNotes(types.includes('notes'));

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

  // Sincronización en tiempo real desactivada para desarrollo local
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

      {/* Contenido compartido según selección */}
      <div className="mx-4 my-4 rounded-lg shadow-2xl overflow-hidden bg-white" style={{minHeight: 'calc(100vh - 120px)'}}>
        <div className="p-8 flex flex-col gap-8">
          {showSlide && currentFragment.slide && (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Diapositiva</h2>
              <div className="w-full text-center" dangerouslySetInnerHTML={{ __html: currentFragment.slide }} />
            </div>
          )}
          {showReading && currentFragment.readingMaterial && (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Lectura</h2>
              <div className="w-full text-left" dangerouslySetInnerHTML={{ __html: currentFragment.readingMaterial }} />
            </div>
          )}
          {showAids && currentFragment.studyAids && (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Ayudas</h2>
              <div className="w-full text-left" dangerouslySetInnerHTML={{ __html: currentFragment.studyAids }} />
            </div>
          )}
          {showNotes && (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Notas</h2>
              <div className="w-full text-left text-gray-700">(Las notas compartidas estarán aquí en la versión final)</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="bg-gray-900 text-gray-400 text-center py-2">
        <p className="text-xs">Líder Interactivo CMM • Vista Compartida</p>
      </div>
    </div>
  );
}
