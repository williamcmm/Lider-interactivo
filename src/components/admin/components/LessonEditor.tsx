import { FiArrowLeft, FiPlus, FiSave, FiLoader } from 'react-icons/fi';
import { LessonEditorProps } from '../types';
import { FragmentEditor } from './FragmentEditor';

export function LessonEditor({
  container,
  selectedLessonIndex,
  fragments,
  editingFragmentIndex,
  onSelectLesson,
  onFragmentEdit,
  onFragmentUpdate,
  onAddFragment,
  onRemoveFragment,
  onSaveFragments,
  onFinish,
  isSaving
}: LessonEditorProps) {
  
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
            <h2 className="text-xl font-semibold text-gray-900">
              Editando: {container.title}
            </h2>
            <p className="text-sm text-gray-600">
              Lección actual: {currentLesson?.title}
            </p>
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
            {container.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(index)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  index === selectedLessonIndex
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{lesson.order}. {lesson.title}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {lesson.fragments.length} fragmentos
                </div>
              </button>
            ))}
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
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiPlus className="w-3 h-3 mr-1" />
              Agregar Fragmento
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Primer Fragmento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
