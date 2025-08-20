import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { CreationFormProps } from '../types';

export function CreationForm({ form, type, onFormChange, onSave, onCancel }: CreationFormProps) {
  const handleLessonsCountChange = (count: number) => {
    const lessons = Array.from({ length: count }, (_, i) => {
      const existingLesson = form.lessons[i];
      return existingLesson || { title: '', order: i + 1 };
    });

    onFormChange({
      ...form,
      lessonsCount: count,
      lessons
    });
  };

  const handleLessonTitleChange = (index: number, title: string) => {
    const updatedLessons = [...form.lessons];
    updatedLessons[index] = { ...updatedLessons[index], title };
    
    onFormChange({
      ...form,
      lessons: updatedLessons
    });
  };

  const addAudioFile = () => {
    const newAudio = {
      id: `audio_${Date.now()}`,
      name: `Nueva pista ${form.audioFiles.length + 1}`,
      type: 'remote' as const
    };
    
    onFormChange({
      ...form,
      audioFiles: [...form.audioFiles, newAudio]
    });
  };

  const updateAudioFile = (index: number, field: string, value: any) => {
    const updatedAudio = [...form.audioFiles];
    updatedAudio[index] = { ...updatedAudio[index], [field]: value };
    
    onFormChange({
      ...form,
      audioFiles: updatedAudio
    });
  };

  const removeAudioFile = (index: number) => {
    const updatedAudio = form.audioFiles.filter((_, i) => i !== index);
    onFormChange({
      ...form,
      audioFiles: updatedAudio
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Crear Nuevo {type === 'seminars' ? 'Seminario' : 'Serie'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiSave className="w-4 h-4 mr-2" />
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <FiX className="w-4 h-4 mr-2" />
            Cancelar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del seminario/serie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descripción opcional..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Lecciones
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={form.lessonsCount}
              onChange={(e) => handleLessonsCountChange(parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lecciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Títulos de Lecciones</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {form.lessons.map((lesson, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => handleLessonTitleChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Lección ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Archivos de Audio */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Archivos de Audio ({form.audioFiles.length})
          </h3>
          <button
            onClick={addAudioFile}
            className="cursor-pointer px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiPlus className="w-3 h-3 mr-1" />
            Agregar Audio
          </button>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto">
          {form.audioFiles.map((audio, index) => (
            <div key={audio.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={audio.name}
                  onChange={(e) => updateAudioFile(index, 'name', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del audio"
                />
                <select
                  value={audio.type}
                  onChange={(e) => updateAudioFile(index, 'type', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="local">Local</option>
                  <option value="remote">URL</option>
                </select>
                <button
                  onClick={() => removeAudioFile(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Eliminar audio"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              {audio.type === 'remote' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={audio.url || ''}
                    onChange={(e) => updateAudioFile(index, 'url', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL del archivo MP3"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
