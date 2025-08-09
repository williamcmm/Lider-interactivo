// Archivo corregido: AdminPanel_backup.tsx
// Estructura JSX reparada y cierres de etiquetas asegurados

'use client';
import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiBook, FiList, FiSave, FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Tipos TypeScript
interface AudioFile {
  id: string;
  url: string;
  title: string;
  duration?: number;
}

interface Fragment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  audioFile?: AudioFile;
  fragments: Fragment[];
  order: number;
}

interface StudyContainer {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

interface Seminar extends StudyContainer {
  type: 'seminar';
}

interface Series extends StudyContainer {
  type: 'series';
}

// Si no se requieren props, se puede omitir la interface o usar 'object' explícitamente
type AdminPanelProps = object;

export function AdminPanel({}: AdminPanelProps) {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'seminars' | 'series'>('seminars');
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  const [isEditingLessons, setIsEditingLessons] = useState(false);
  const [editingContainer, setEditingContainer] = useState<StudyContainer | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    order: 0
  });
  
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());
  // Eliminado: editingLesson no se usa

  // Funciones de manejo de contenedores
  const handleCreateContainer = () => {
    setIsCreatingContainer(true);
    setFormData({ title: '', description: '' });
  };

  const handleCancelCreation = () => {
    setIsCreatingContainer(false);
    setFormData({ title: '', description: '' });
  };

  // Reemplaza handleSaveContainer para guardar en Firestore
  const handleSaveContainer = async () => {
    if (!formData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    const newContainer: StudyContainer = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, activeTab), newContainer);
      newContainer.id = docRef.id;
      if (activeTab === 'seminars') {
        setSeminars([...seminars, { ...newContainer, type: 'seminar' }]);
      } else {
        setSeries([...series, { ...newContainer, type: 'series' }]);
      }
      handleCancelCreation();
    } catch (error) {
      alert('Error al guardar en Firestore');
      console.error(error);
    }
  };

  const handleDeleteContainer = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contenedor?')) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
      if (activeTab === 'seminars') {
        setSeminars(seminars.filter(s => s.id !== id));
      } else {
        setSeries(series.filter(s => s.id !== id));
      }
    } catch (error) {
      alert('Error al eliminar en Firestore');
      console.error(error);
    }
  };

  const handleEditLessons = (container: StudyContainer) => {
    setEditingContainer(container);
    setIsEditingLessons(true);
  };

  const toggleContainerExpansion = (id: string) => {
    const newExpanded = new Set(expandedContainers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedContainers(newExpanded);
  };

  // Funciones de manejo de lecciones
  const handleAddLesson = () => {
    if (!lessonFormData.title.trim()) {
      alert('El título de la lección es requerido');
      return;
    }

    if (!editingContainer) return;

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: lessonFormData.title,
      description: lessonFormData.description,
      order: lessonFormData.order || editingContainer.lessons.length + 1,
      fragments: []
    };

    const updatedContainer = {
      ...editingContainer,
      lessons: [...editingContainer.lessons, newLesson],
      updatedAt: new Date()
    };

    updateContainer(updatedContainer);
    setLessonFormData({ title: '', description: '', order: 0 });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta lección?')) return;
    if (!editingContainer) return;

    const updatedContainer = {
      ...editingContainer,
      lessons: editingContainer.lessons.filter(l => l.id !== lessonId),
      updatedAt: new Date()
    };

    updateContainer(updatedContainer);
  };

  // Reemplaza updateContainer para actualizar en Firestore
  const updateContainer = async (updatedContainer: StudyContainer) => {
    try {
      // Convertir el objeto a formato plano para Firestore
      const dataToUpdate = JSON.parse(JSON.stringify({
        title: updatedContainer.title,
        description: updatedContainer.description,
        lessons: updatedContainer.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          fragments: lesson.fragments || [],
          audioFile: lesson.audioFile || null
        })),
        updatedAt: new Date().toISOString(),
        type: activeTab === 'seminars' ? 'seminar' : 'series'
      }));

      await updateDoc(
        doc(db, activeTab, updatedContainer.id),
        dataToUpdate
      );

      if (activeTab === 'seminars') {
        setSeminars(seminars.map(s =>
          s.id === updatedContainer.id
            ? { ...updatedContainer, type: 'seminar' }
            : s
        ));
      } else {
        setSeries(series.map(s =>
          s.id === updatedContainer.id
            ? { ...updatedContainer, type: 'series' }
            : s
        ));
      }
      setEditingContainer(updatedContainer);
      console.log('Contenedor actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el contenedor:', error);
      alert('Error al actualizar. Por favor, intenta nuevamente.');
    }
  };

  const handleBackFromLessons = () => {
    setIsEditingLessons(false);
    setEditingContainer(null);
    setLessonFormData({ title: '', description: '', order: 0 });
  };

  // Obtener contenedores actuales según la pestaña activa
  const currentContainers = activeTab === 'seminars' ? seminars : series;

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Administrador - Líder Interactivo CMM
              </h1>
              <p className="text-gray-600">
                Gestiona seminarios, series y lecciones
              </p>
            </div>
            {!isCreatingContainer && !isEditingLessons && (
              <button
                onClick={handleCreateContainer}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Crear {activeTab === 'seminars' ? 'Seminario' : 'Serie'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mostrar formulario de creación si está activo */}
        {isCreatingContainer ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header del formulario */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Crear {activeTab === 'seminars' ? 'Seminario' : 'Serie'}
              </h2>
              <button
                onClick={handleCancelCreation}
                className="inline-flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Volver
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa el título"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa la descripción"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCancelCreation}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveContainer}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSave className="mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        ) : isEditingLessons && editingContainer ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              {/* Header de edición de lecciones */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Gestionar Lecciones
                  </h2>
                  <p className="text-gray-600">
                    {editingContainer.title}
                  </p>
                </div>
                <button
                  onClick={handleBackFromLessons}
                  className="inline-flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Volver
                </button>
              </div>

              {/* Formulario para agregar lección */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Agregar Nueva Lección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título de la lección"
                  />
                  <input
                    type="text"
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción"
                  />
                  <button
                    onClick={handleAddLesson}
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de lecciones */}
              <div className="space-y-3">
                {editingContainer.lessons.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay lecciones aún. Agrega la primera lección arriba.
                  </p>
                ) : (
                  editingContainer.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {lesson.title}
                          </h4>
                          {lesson.description && (
                            <p className="text-sm text-gray-600">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          // onClick eliminado: setEditingLesson no existe ni se usa
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('seminars')}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'seminars'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiBook className="mr-2" />
                  Seminarios ({seminars.length})
                </button>
                <button
                  onClick={() => setActiveTab('series')}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'series'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiList className="mr-2" />
                  Series ({series.length})
                </button>
              </div>
            </div>

            {/* Lista de contenedores */}
            <div className="p-6">
              {currentContainers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No hay {activeTab === 'seminars' ? 'seminarios' : 'series'} creados aún
                  </p>
                  <button
                    onClick={handleCreateContainer}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Crear el primero
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentContainers.map((container) => (
                    <div
                      key={container.id}
                      className="border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {container.title}
                            </h3>
                            {container.description && (
                              <p className="text-gray-600 mt-1">
                                {container.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>{container.lessons.length} lecciones</span>
                              <span>•</span>
                              <span>
                                Creado: {new Date(container.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => toggleContainerExpansion(container.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {expandedContainers.has(container.id) ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditLessons(container)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteContainer(container.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>

                        {/* Lista expandible de lecciones */}
                        {expandedContainers.has(container.id) && container.lessons.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Lecciones:
                            </h4>
                            <div className="space-y-2">
                              {container.lessons.map((lesson, index) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                >
                                  <span className="text-sm font-medium text-gray-500">
                                    {index + 1}.
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {lesson.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
