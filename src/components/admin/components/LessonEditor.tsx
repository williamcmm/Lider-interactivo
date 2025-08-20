import { FiArrowLeft, FiPlus, FiSave, FiLoader, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { LessonEditorProps } from '../types';
import { FragmentEditor } from './FragmentEditor';
import { useState } from 'react';

export function LessonEditor({
  container,
  selectedLessonIndex,
  fragments,
  editingFragmentIndex,
  onSelectLesson,
  onUpdateContainerTitle,
  onUpdateLessonTitle,
  onFragmentEdit,
  onFragmentUpdate,
  onAddFragment,
  onRemoveFragment,
  onSaveFragments,
  onFinish,
  isSaving,
  isAddingFragment
}: LessonEditorProps) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string>("");
  const [editingContainer, setEditingContainer] = useState<boolean>(false);
  const [containerTitleDraft, setContainerTitleDraft] = useState<string>(container.title);
  
  // Funciones para manejo de fragmentos
  const updateFragment = (index: number, field: string, value: any) => {
    const updatedFragments = [...fragments];
    updatedFragments[index] = { ...updatedFragments[index], [field]: value };
    onFragmentUpdate(updatedFragments);
  };

  // Funciones para slides
  const addSlide = (fragmentIndex: number) => {
    const fragment = fragments[fragmentIndex];
    const newSlide = {
      id: `slide_${Date.now()}`,
      order: fragment.slides.length + 1,
      title: `Nueva Diapositiva ${fragment.slides.length + 1}`,
      content: '<h2>Título</h2><p>Contenido de la diapositiva...</p>'
    };

    const updatedFragments = [...fragments];
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: [...fragment.slides, newSlide]
    };
    onFragmentUpdate(updatedFragments);
  };

  const updateSlide = (fragmentIndex: number, slideIndex: number, field: string, value: string) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedSlides = [...fragment.slides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], [field]: value };
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: updatedSlides
    };
    onFragmentUpdate(updatedFragments);
  };

  const removeSlide = (fragmentIndex: number, slideIndex: number) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedSlides = fragment.slides.filter((_, i) => i !== slideIndex);
    
    // Reordenar
    updatedSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: updatedSlides
    };
    onFragmentUpdate(updatedFragments);
  };

  // Funciones para videos
  const addVideo = (fragmentIndex: number) => {
    const fragment = fragments[fragmentIndex];
    const newVideo = {
      id: `video_${Date.now()}`,
      order: fragment.videos.length + 1,
      title: `Nuevo Video ${fragment.videos.length + 1}`,
      youtubeId: 'dQw4w9WgXcQ',
      description: ''
    };

    const updatedFragments = [...fragments];
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: [...fragment.videos, newVideo]
    };
    onFragmentUpdate(updatedFragments);
  };

  const updateVideo = (fragmentIndex: number, videoIndex: number, field: string, value: string) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedVideos = [...fragment.videos];
    updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], [field]: value };
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: updatedVideos
    };
    onFragmentUpdate(updatedFragments);
  };

  const removeVideo = (fragmentIndex: number, videoIndex: number) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedVideos = fragment.videos.filter((_, i) => i !== videoIndex);
    
    // Reordenar
    updatedVideos.forEach((video, index) => {
      video.order = index + 1;
    });
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: updatedVideos
    };
    onFragmentUpdate(updatedFragments);
  };

  const currentLesson = container.lessons[selectedLessonIndex];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onFinish}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {editingContainer ? (
                <>
                  <input
                    autoFocus
                    value={containerTitleDraft}
                    onChange={(e) => setContainerTitleDraft(e.target.value)}
                    className="text-xl font-semibold bg-transparent border-0 border-b border-blue-400 focus:outline-none focus:border-blue-600 px-1 py-0.5 text-gray-900"
                  />
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-700"
                    onClick={async () => {
                      const newTitle = containerTitleDraft.trim();
                      if (!newTitle || !onUpdateContainerTitle) return setEditingContainer(false);
                      await onUpdateContainerTitle(container.id, newTitle);
                      setEditingContainer(false);
                    }}
                    aria-label="Confirmar título contenedor"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setContainerTitleDraft(container.title);
                      setEditingContainer(false);
                    }}
                    aria-label="Cancelar título contenedor"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">Editando: {container.title}</h2>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setContainerTitleDraft(container.title);
                      setEditingContainer(true);
                    }}
                    aria-label="Editar título contenedor"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>Lección actual:</span>
              {editingLessonId === currentLesson?.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editingLessonTitle}
                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                    className="bg-transparent border-0 border-b border-blue-400 focus:outline-none focus:border-blue-600 px-1 py-0.5"
                  />
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-700"
                    onClick={async () => {
                      if (!currentLesson) return;
                      const newTitle = editingLessonTitle.trim();
                      if (!newTitle) return;
                      await onUpdateLessonTitle(currentLesson.id, newTitle);
                      setEditingLessonId(null);
                      setEditingLessonTitle("");
                    }}
                    aria-label="Confirmar"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setEditingLessonId(null);
                      setEditingLessonTitle("");
                    }}
                    aria-label="Cancelar"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentLesson?.title}</span>
                  {currentLesson && (
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setEditingLessonId(currentLesson.id);
                        setEditingLessonTitle(currentLesson.title);
                      }}
                      aria-label="Editar título"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSaveFragments}
            disabled={isSaving}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center ${isSaving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isSaving ? (
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FiSave className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de lecciones */}
        <div className="lg:col-span-1">
          <h3 className="font-medium text-gray-900 mb-4">Lecciones</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {container.lessons.map((lesson, index) => {
              const isSelected = index === selectedLessonIndex;
              const isEditing = editingLessonId === lesson.id;
              return (
                <div key={lesson.id} className={`p-3 rounded-lg text-sm transition-colors ${isSelected ? 'bg-blue-100 text-blue-800 border-2 border-blue-200' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectLesson(index)}
                      className="text-left flex-1"
                    >
                      <div className="font-medium flex items-center gap-2">
                        <span>{lesson.order}.</span>
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingLessonTitle}
                            onChange={(e) => setEditingLessonTitle(e.target.value)}
                            className="bg-transparent border-0 border-b border-blue-400 focus:outline-none focus:border-blue-600 px-1 py-0.5 w-full"
                          />
                        ) : (
                          <span>{lesson.title}</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {lesson.fragments.length} fragmentos
                      </div>
                    </button>
                    {isEditing ? (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            const newTitle = editingLessonTitle.trim();
                            if (!newTitle) return;
                            await onUpdateLessonTitle(lesson.id, newTitle);
                            setEditingLessonId(null);
                            setEditingLessonTitle("");
                          }}
                          aria-label="Confirmar"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setEditingLessonId(null);
                            setEditingLessonTitle("");
                          }}
                          aria-label="Cancelar"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 ml-2"
                        onClick={() => {
                          setEditingLessonId(lesson.id);
                          setEditingLessonTitle(lesson.title);
                        }}
                        aria-label="Editar título"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor de fragmentos */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">
              Fragmentos de: {currentLesson?.title}
            </h3>
            <button
              onClick={onAddFragment}
              disabled={isAddingFragment}
              className={`px-3 py-1 text-sm text-white rounded-lg transition-colors flex items-center ${isAddingFragment ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isAddingFragment ? (
                <FiLoader className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <FiPlus className="w-3 h-3 mr-1" />
              )}
              {isAddingFragment ? 'Agregando...' : 'Agregar Fragmento'}
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {fragments.map((fragment, index) => (
              <FragmentEditor
                key={fragment.id}
                fragment={fragment}
                index={index}
                isEditing={editingFragmentIndex === index}
                onEdit={onFragmentEdit}
                onUpdate={updateFragment}
                onRemove={onRemoveFragment}
                onAddSlide={addSlide}
                onUpdateSlide={updateSlide}
                onRemoveSlide={removeSlide}
                onAddVideo={addVideo}
                onUpdateVideo={updateVideo}
                onRemoveVideo={removeVideo}
              />
            ))}
            
            {fragments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No hay fragmentos en esta lección</p>
                <button
                  onClick={onAddFragment}
                  disabled={isAddingFragment}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${isAddingFragment ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isAddingFragment ? 'Agregando...' : 'Crear Primer Fragmento'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
