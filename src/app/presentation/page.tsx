'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson, Fragment } from '@/types';
import { getLessonById } from '@/actions/admin/lessons/get-lessons-by-id';
import NotesPanel from '@/components/NotesSection/NotesPanel';
import { useNotesStore } from '@/store/notesStore';

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [currentFragment, setCurrentFragment] = useState<Fragment | null>(null);
  
  // Hook del store de notas para esta página de presentación
  const { setCurrentFragmentId } = useNotesStore();

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    const fragmentIndex = parseInt(searchParams.get('fragment') || '0');

    if (lessonId) {
      getLessonById(lessonId).then((res) => {
        if (!res.ok) return;
        const l: any = res.lesson;
        const mapped: Lesson = {
          id: l.id,
          title: l.title,
          content: l.content,
          containerId: l.seminarId ?? l.seriesId ?? "",
          containerType: l.containerType === 'SEMINAR' ? 'seminar' : 'series',
          order: l.order,
          fragments: (l.fragments ?? []).map((f: any) => ({
            id: f.id,
            order: f.order,
            readingMaterial: f.readingMaterial,
            slides: (f.slides ?? []).map((sl: any) => ({ id: sl.id, title: sl.title, content: sl.content, order: sl.order })),
            videos: (f.videos ?? []).map((v: any) => ({ id: v.id, title: v.title, youtubeId: v.youtubeId, description: v.description ?? undefined, order: v.order })),
            studyAids: f.studyAids,
            narrationAudio: undefined,
            isCollapsed: f.isCollapsed ?? false,
          }))
        } as any;

        setLesson(mapped);
        setCurrentFragmentIndex(fragmentIndex);
        const selectedFragment = mapped.fragments[fragmentIndex] || null;
        setCurrentFragment(selectedFragment);
        if (selectedFragment) setCurrentFragmentId(selectedFragment.id);
      });
    }
  }, [searchParams]);

  // Escuchar mensajes de la ventana principal para actualizar la diapositiva
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'update-slide') {
        setCurrentFragmentIndex(event.data.fragmentIndex);
        if (lesson && lesson.fragments[event.data.fragmentIndex]) {
          const newFragment = lesson.fragments[event.data.fragmentIndex];
          setCurrentFragment(newFragment);
          
          // Actualizar también el store de notas
          setCurrentFragmentId(newFragment.id);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lesson, setCurrentFragmentId]);

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
        <div className="flex-1 flex items-center justify-center p-8 gap-8">
          <div className="w-2/3 h-full bg-white text-black rounded-lg shadow-2xl overflow-hidden">
            {currentFragment.slides && currentFragment.slides.length > 0 ? (
              <div 
                className="w-full h-full p-8 flex items-center justify-center text-center"
                dangerouslySetInnerHTML={{ __html: currentFragment.slides[0].content }}
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
          <div className="w-1/3 h-full">
            <NotesPanel />
          </div>
        </div>

        {/* Footer con controles básicos */}
        <div className="bg-gray-900 p-2 text-center text-sm">
          Presentación • Líder Interactivo CMM
        </div>
      </div>
  );
}
