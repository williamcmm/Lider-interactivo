import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FragmentEditorProps } from '../types';

export function FragmentEditor({
  fragment,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  onAddSlide,
  onUpdateSlide,
  onRemoveSlide,
  onAddVideo,
  onUpdateVideo,
  onRemoveVideo
}: FragmentEditorProps) {

  const addFragmentAudio = () => {
    onUpdate(index, 'narrationAudio', {
      id: `audio_${Date.now()}`,
      name: `Audio Fragmento ${index + 1}`,
      type: 'remote'
    });
  };

  const updateFragmentAudio = (field: string, value: any) => {
    if (fragment.narrationAudio) {
      onUpdate(index, 'narrationAudio', {
        ...fragment.narrationAudio,
        [field]: value
      });
    }
  };

  const removeFragmentAudio = () => {
    onUpdate(index, 'narrationAudio', undefined);
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-4">
      {/* Encabezado del fragmento */}
      <div className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div
          className="flex items-center cursor-pointer flex-1"
          onClick={() => onEdit(isEditing ? -1 : index)}
        >
          <span className="font-medium text-gray-900">
            Fragmento {fragment.order}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            ({fragment.slides.length} slides, {fragment.videos.length} videos)
          </span>
          <div className="ml-auto mr-4">
            {isEditing ? (
              <FiChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <FiChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
          title="Eliminar fragmento"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Contenido expandido */}
      {isEditing && (
        <div className="space-y-6 p-4">
          {/* Material de lectura */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Material de Lectura
            </label>
            <textarea
              value={fragment.readingMaterial}
              onChange={(e) => onUpdate(index, 'readingMaterial', e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder="Texto bíblico, contenido de estudio..."
            />
          </div>

          {/* Diapositivas */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Diapositivas ({fragment.slides.length})
              </label>
              <button
                onClick={() => onAddSlide(index)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiPlus className="w-3 h-3 mr-1" />
                Agregar Diapositiva
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {fragment.slides.map((slide, slideIndex) => (
                <div key={slide.id} className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Diapositiva {slide.order}
                    </span>
                    <button
                      onClick={() => onRemoveSlide(index, slideIndex)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar diapositiva"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => onUpdateSlide(index, slideIndex, 'title', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Título de la diapositiva"
                    />
                    <textarea
                      value={slide.content}
                      onChange={(e) => onUpdateSlide(index, slideIndex, 'content', e.target.value)}
                      className="w-full h-20 border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                      placeholder="Contenido HTML de la diapositiva..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Videos de YouTube ({fragment.videos.length})
              </label>
              <button
                onClick={() => onAddVideo(index)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FiPlus className="w-3 h-3 mr-1" />
                Agregar Video
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {fragment.videos.map((video, videoIndex) => (
                <div key={video.id} className="border border-gray-200 rounded-lg p-3 bg-red-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-red-700">
                      Video {video.order}
                    </span>
                    <button
                      onClick={() => onRemoveVideo(index, videoIndex)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar video"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => onUpdateVideo(index, videoIndex, 'title', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Título del video"
                    />
                    <input
                      type="text"
                      value={video.youtubeId}
                      onChange={(e) => onUpdateVideo(index, videoIndex, 'youtubeId', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="ID de YouTube (ej: dQw4w9WgXcQ)"
                    />
                    <textarea
                      value={video.description || ''}
                      onChange={(e) => onUpdateVideo(index, videoIndex, 'description', e.target.value)}
                      className="w-full h-16 border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                      placeholder="Descripción del video..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ayudas de estudio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ayudas de Estudio
            </label>
            <textarea
              value={fragment.studyAids}
              onChange={(e) => onUpdate(index, 'studyAids', e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder="Preguntas, comentarios, material de apoyo..."
            />
          </div>

          {/* Audio de Narración */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Audio de Narración
              </label>
              {!fragment.narrationAudio && (
                <button
                  onClick={addFragmentAudio}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Agregar
                </button>
              )}
            </div>
            {fragment.narrationAudio ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fragment.narrationAudio.name}
                    onChange={(e) => updateFragmentAudio('name', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del audio"
                  />
                  <button
                    onClick={removeFragmentAudio}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={fragment.narrationAudio.type}
                  onChange={(e) => updateFragmentAudio('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="local">Archivo Local</option>
                  <option value="remote">URL Remota</option>
                </select>
                {fragment.narrationAudio.type === 'remote' && (
                  <input
                    type="text"
                    value={fragment.narrationAudio.url || ''}
                    onChange={(e) => updateFragmentAudio('url', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL del archivo MP3"
                  />
                )}
              </div>
            ) : (
              <div className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                Sin audio de narración
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
