// ...existing code...
import Link from 'next/link';
// ...existing code...
<Link href="/">Inicio</Link>
'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiBook, FiList, FiSave, FiArrowLeft, FiX, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { Seminar, Series, Lesson, StudyContainer, Fragment, AudioFile } from '@/types';
import { LocalStorage } from '@/lib/storage';

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'seminars' | 'series'>('seminars');
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  const [isEditingLessons, setIsEditingLessons] = useState(false);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [editingContainer, setEditingContainer] = useState<StudyContainer | null>(null);

  // Estado para el formulario de creación inline
  const [creationForm, setCreationForm] = useState({
    title: '',
    description: '',
    lessonsCount: 10,
    lessons: Array.from({ length: 10 }, (_, i) => ({ title: '', order: i + 1 })),
    audioFiles: [] as AudioFile[]
  });

  // Estado para edición de fragmentos de lecciones
  const [fragmentsData, setFragmentsData] = useState<Fragment[]>([]);
  const [editingFragmentIndex, setEditingFragmentIndex] = useState<number | null>(null);

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    // Solo cargar datos existentes, SIN crear mock data automáticamente
    const storedSeminars = LocalStorage.getSeminars();
    const storedSeries = LocalStorage.getSeries();
    
    setSeminars(storedSeminars);
    setSeries(storedSeries);
    
    // Log para verificar estado
    console.log('Datos cargados:', { seminars: storedSeminars.length, series: storedSeries.length });
  }, []);

  const currentData = activeTab === 'seminars' ? seminars : series;

  // ============== FUNCIONES PARA MANEJO DE CONTENEDORES ==============
  
  const handleCreateContainer = () => {
    setIsCreatingContainer(true);
    resetCreationForm();
  };

  const resetCreationForm = () => {
    setCreationForm({
      title: '',
      description: '',
      lessonsCount: 10,
      lessons: Array.from({ length: 10 }, (_, i) => ({ title: '', order: i + 1 })),
      audioFiles: []
    });
  };

  const handleCancelCreation = () => {
    setIsCreatingContainer(false);
    resetCreationForm();
  };

  const handleLessonsCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(50, count));
    setCreationForm(prev => ({
      ...prev,
      lessonsCount: newCount,
      lessons: Array.from({ length: newCount }, (_, i) => {
        const existingLesson = prev.lessons[i];
        return existingLesson || { title: '', order: i + 1 };
      })
    }));
  };

  const handleLessonTitleChange = (index: number, title: string) => {
    setCreationForm(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, title } : lesson
      )
    }));
  };

  // ============== FUNCIONES PARA ARCHIVOS DE AUDIO DEL SEMINARIO ==============
  
  const updateAudioFile = (index: number, field: keyof AudioFile, value: string) => {
    setCreationForm(prev => ({
      ...prev,
      audioFiles: prev.audioFiles.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    }));
  };

  const addAudioFile = () => {
    const newAudioFile: AudioFile = {
      id: `audio-${Date.now()}`,
      name: '',
      type: 'local'
    };
    setCreationForm(prev => ({
      ...prev,
      audioFiles: [...prev.audioFiles, newAudioFile]
    }));
  };

  const removeAudioFile = (index: number) => {
    setCreationForm(prev => ({
      ...prev,
      audioFiles: prev.audioFiles.filter((_, i) => i !== index)
    }));
  };

  // ============== FUNCIONES PARA MANEJO DE FRAGMENTOS ==============
  
  const addFragment = () => {
    const newFragment: Fragment = {
      id: `fragment-${Date.now()}`,
      order: fragmentsData.length + 1,
      readingMaterial: '',
      slide: '',
      studyAids: '',
      isCollapsed: false
    };
    setFragmentsData([...fragmentsData, newFragment]);
  };

  const updateFragment = (index: number, field: keyof Fragment, value: string | number | boolean | AudioFile | undefined) => {
    const updatedFragments = fragmentsData.map((fragment, i) => 
      i === index ? { ...fragment, [field]: value } : fragment
    );
    setFragmentsData(updatedFragments);
  };

  const removeFragment = (index: number) => {
    setFragmentsData(fragmentsData.filter((_, i) => i !== index));
    if (editingFragmentIndex === index) {
      setEditingFragmentIndex(null);
    }
  };

  // ============== FUNCIONES PARA AUDIO DE NARRACIÓN EN FRAGMENTOS ==============
  
  const addFragmentAudio = (fragmentIndex: number) => {
    const newAudioFile: AudioFile = {
      id: `narration-${Date.now()}`,
      name: '',
      type: 'local'
    };
    updateFragment(fragmentIndex, 'narrationAudio', newAudioFile);
  };

  const updateFragmentAudio = (fragmentIndex: number, field: keyof AudioFile, value: string) => {
    const fragment = fragmentsData[fragmentIndex];
    if (fragment.narrationAudio) {
      const updatedAudio = { ...fragment.narrationAudio, [field]: value };
      updateFragment(fragmentIndex, 'narrationAudio', updatedAudio);
    }
  };

  const removeFragmentAudio = (fragmentIndex: number) => {
    updateFragment(fragmentIndex, 'narrationAudio', undefined);
  };

  // ============== FUNCIONES PARA GUARDADO Y EDICIÓN ==============
  
  const saveIndividualFragment = (index: number) => {
    if (!editingContainer) return;

    const updatedLessons = [...editingContainer.lessons];
    updatedLessons[selectedLessonIndex] = {
      ...updatedLessons[selectedLessonIndex],
      fragments: fragmentsData
    };

    const updatedContainer = {
      ...editingContainer,
      lessons: updatedLessons
    };

    updateContainerInState(updatedContainer);
    setEditingContainer(updatedContainer);
    setEditingFragmentIndex(null);
    alert(`Fragmento ${fragmentsData[index].order} guardado exitosamente`);
  };

  const updateContainerInState = (container: StudyContainer) => {
    if (container.type === 'seminar') {
      const updatedSeminars = seminars.map(s => 
        s.id === container.id ? container as Seminar : s
      );
      setSeminars(updatedSeminars);
      // ✅ GUARDAR EN LOCALSTORAGE
      LocalStorage.saveSeminars(updatedSeminars);
    } else {
      const updatedSeries = series.map(s => 
        s.id === container.id ? container as Series : s
      );
      setSeries(updatedSeries);
      // ✅ GUARDAR EN LOCALSTORAGE
      LocalStorage.saveSeries(updatedSeries);
    }
  };

  const startEditingFragment = (index: number) => {
    setEditingFragmentIndex(index);
  };

  const cancelEditingFragment = () => {
    setEditingFragmentIndex(null);
  };

  const handleSaveContainer = () => {
    if (!creationForm.title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    const newContainer = {
      id: `${activeTab === 'seminars' ? 'sem' : 'ser'}-${Date.now()}`,
      title: creationForm.title,
      description: creationForm.description,
      order: currentData.length + 1,
      type: activeTab === 'seminars' ? 'seminar' as const : 'series' as const,
      audioFiles: creationForm.audioFiles.filter(file => file.name.trim()),
      lessons: creationForm.lessons
        .filter(lesson => lesson.title.trim())
        .map((lesson, index) => ({
          id: `lesson-${Date.now()}-${index}`,
          title: lesson.title,
          content: `<p>Contenido de la lección: ${lesson.title}</p>`,
          containerId: `${activeTab === 'seminars' ? 'sem' : 'ser'}-${Date.now()}`,
          containerType: activeTab === 'seminars' ? 'seminar' as const : 'series' as const,
          order: lesson.order,
          fragments: [
            {
              id: `fragment-${Date.now()}-${index}-1`,
              order: 1,
              readingMaterial: '<p>Material de lectura inicial</p>',
              slide: '<p>Diapositiva inicial</p>',
              studyAids: '<p>Ayudas de estudio iniciales</p>',
              isCollapsed: false
            }
          ]
        }))
    };

    // Guardar en localStorage y actualizar estado local
    if (activeTab === 'seminars') {
      const newSeminar = newContainer as Seminar;
      LocalStorage.addSeminar(newSeminar);
      setSeminars([...seminars, newSeminar]);
    } else {
      const newSeries = newContainer as Series;
      LocalStorage.addSeries(newSeries);
      setSeries([...series, newSeries]);
    }

    // Volver a la vista principal en lugar de ir a edición
    setIsCreatingContainer(false);
    resetCreationForm();
    
    alert(`${activeTab === 'seminars' ? 'Seminario' : 'Serie'} "${newContainer.title}" creado exitosamente`);
  };

  const handleEditLessons = (container: Seminar | Series) => {
    const studyContainer: StudyContainer = {
      ...container,
      type: activeTab === 'seminars' ? 'seminar' : 'series'
    };
    setEditingContainer(studyContainer);
    setIsEditingLessons(true);
    setSelectedLessonIndex(0);
    
    // Cargar fragmentos de la primera lección
    const firstLesson = container.lessons[0];
    if (firstLesson && firstLesson.fragments) {
      setFragmentsData(firstLesson.fragments);
    } else {
      setFragmentsData([]);
    }
  };

  const handleSelectLesson = (index: number) => {
    setSelectedLessonIndex(index);
    const lesson = editingContainer?.lessons[index];
    if (lesson && lesson.fragments) {
      setFragmentsData(lesson.fragments);
      setEditingFragmentIndex(null);
    } else {
      setFragmentsData([]);
    }
  };

  const handleFinishEditingLessons = () => {
    setIsEditingLessons(false);
    setEditingContainer(null);
    setSelectedLessonIndex(0);
    setFragmentsData([]);
    setEditingFragmentIndex(null);
  };

  const handleDeleteContainer = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      if (activeTab === 'seminars') {
        LocalStorage.deleteSeminar(id);
        setSeminars(seminars.filter(s => s.id !== id));
      } else {
        LocalStorage.deleteSeries(id);
        setSeries(series.filter(s => s.id !== id));
      }
    }
  };

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
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Ir a la aplicación principal de enseñanza"
              >
                <FiBook className="mr-2" />
                Usar Aplicación
              </a>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* FORMULARIO DE CREACIÓN */}
        {isCreatingContainer ? (
          <div className="bg-white rounded-lg shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto p-6">
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

            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del {activeTab === 'seminars' ? 'Seminario' : 'Serie'}
                  </label>
                  <input
                    type="text"
                    value={creationForm.title}
                    onChange={(e) => setCreationForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Nombre del ${activeTab === 'seminars' ? 'seminario' : 'serie'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Lecciones
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLessonsCountChange(creationForm.lessonsCount - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={creationForm.lessonsCount <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={creationForm.lessonsCount}
                      onChange={(e) => handleLessonsCountChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="50"
                    />
                    <button
                      onClick={() => handleLessonsCountChange(creationForm.lessonsCount + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={creationForm.lessonsCount >= 50}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={creationForm.description}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe brevemente el contenido..."
                />
              </div>

              {/* Títulos de lecciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Títulos de las Lecciones
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creationForm.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {lesson.order}
                      </span>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonTitleChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Lección ${lesson.order}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Archivos de Audio del Seminario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Archivos MP3 del Seminario
                  <span className="text-gray-500 text-xs ml-2">(Compartidos por todas las lecciones)</span>
                </label>
                <div className="space-y-3">
                  {creationForm.audioFiles.map((audioFile, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={audioFile.name}
                        onChange={(e) => updateAudioFile(index, 'name', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Nombre del archivo MP3 ${index + 1}`}
                      />
                      <select
                        value={audioFile.type}
                        onChange={(e) => updateAudioFile(index, 'type', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="local">Local</option>
                        <option value="remote">Remoto</option>
                      </select>
                      {audioFile.type === 'remote' && (
                        <input
                          type="text"
                          value={audioFile.url || ''}
                          onChange={(e) => updateAudioFile(index, 'url', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="URL del archivo"
                        />
                      )}
                      <button
                        onClick={() => removeAudioFile(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAudioFile}
                    className="flex items-center text-green-600 hover:text-green-700 text-sm"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Agregar archivo MP3
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={handleCancelCreation}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveContainer}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiSave className="mr-2" />
                  Guardar {activeTab === 'seminars' ? 'Seminario' : 'Serie'}
                </button>
              </div>
            </div>
          </div>
        ) : isEditingLessons && editingContainer ? (
          /* VISTA DE EDICIÓN DE LECCIONES */
          <div className="bg-white rounded-lg shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-6">
              {/* Header de edición */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Editando: {editingContainer.title}
                  </h2>
                  <p className="text-gray-600">
                    Configura el contenido de cada lección
                  </p>
                </div>
                <button
                  onClick={handleFinishEditingLessons}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Volver
                </button>
              </div>

              {/* Pestañas de lecciones */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-1 overflow-x-auto">
                    {editingContainer.lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(index)}
                        className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                          selectedLessonIndex === index
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {lesson.order}. {lesson.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Contenido de la lección seleccionada */}
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Editando Lección {editingContainer.lessons[selectedLessonIndex]?.order}: {editingContainer.lessons[selectedLessonIndex]?.title}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Cada lección está dividida en fragmentos. Cada fragmento contiene: material de lectura, diapositiva, ayudas de estudio y audio de narración opcional.
                  </p>
                </div>

                {/* Lista de fragmentos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      Fragmentos de la Lección ({fragmentsData.length})
                    </h4>
                    <button
                      onClick={addFragment}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiPlus className="mr-2" />
                      Agregar Fragmento
                    </button>
                  </div>

                  {fragmentsData.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No hay fragmentos en esta lección. Haz clic en "Agregar Fragmento" para comenzar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fragmentsData.map((fragment, index) => (
                        <div
                          key={fragment.id}
                          className={`border rounded-lg p-4 ${
                            editingFragmentIndex === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {fragment.order}
                              </span>
                              <h5 className="font-medium text-gray-900">
                                Fragmento {fragment.order}
                              </h5>
                              <button
                                onClick={() => updateFragment(index, 'isCollapsed', !fragment.isCollapsed)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {fragment.isCollapsed ? <FiChevronDown className="h-4 w-4" /> : <FiChevronUp className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              {editingFragmentIndex === index ? (
                                <>
                                  <button
                                    onClick={() => saveIndividualFragment(index)}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <FiSave className="w-3 h-3 mr-1" />
                                    Guardar
                                  </button>
                                  <button
                                    onClick={cancelEditingFragment}
                                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEditingFragment(index)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <FiEdit className="w-3 h-3 mr-1" />
                                  Editar
                                </button>
                              )}
                              <button
                                onClick={() => removeFragment(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {editingFragmentIndex === index && !fragment.isCollapsed && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
                              {/* Material de lectura */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Material de Lectura
                                </label>
                                <textarea
                                  value={fragment.readingMaterial}
                                  onChange={(e) => updateFragment(index, 'readingMaterial', e.target.value)}
                                  className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                  placeholder="Texto bíblico, contenido de estudio..."
                                />
                              </div>

                              {/* Diapositiva */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Diapositiva
                                </label>
                                <textarea
                                  value={fragment.slide}
                                  onChange={(e) => updateFragment(index, 'slide', e.target.value)}
                                  className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                  placeholder="URL de imagen, contenido visual..."
                                />
                              </div>

                              {/* Ayudas de estudio */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Ayudas de Estudio
                                </label>
                                <textarea
                                  value={fragment.studyAids}
                                  onChange={(e) => updateFragment(index, 'studyAids', e.target.value)}
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
                                      onClick={() => addFragmentAudio(index)}
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
                                        onChange={(e) => updateFragmentAudio(index, 'name', e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nombre del audio"
                                      />
                                      <button
                                        onClick={() => removeFragmentAudio(index)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <FiTrash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <select
                                      value={fragment.narrationAudio.type}
                                      onChange={(e) => updateFragmentAudio(index, 'type', e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="local">Archivo Local</option>
                                      <option value="remote">URL Remota</option>
                                    </select>
                                    {fragment.narrationAudio.type === 'remote' && (
                                      <input
                                        type="text"
                                        value={fragment.narrationAudio.url || ''}
                                        onChange={(e) => updateFragmentAudio(index, 'url', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="URL del archivo MP3"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                    Sin audio de narración
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información sobre archivos MP3 del seminario */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Archivos MP3 del Seminario
                  </h4>
                  <p className="text-green-700 text-sm mb-3">
                    Los archivos de audio se configuran a nivel del seminario y están disponibles para todas las lecciones.
                  </p>
                  {editingContainer.audioFiles && editingContainer.audioFiles.length > 0 ? (
                    <ul className="space-y-1">
                      {editingContainer.audioFiles.map((file, index) => (
                        <li key={index} className="text-sm text-green-700">
                          • {file.name || 'Sin nombre'} ({file.type})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 text-sm">
                      No hay archivos MP3 configurados para este seminario.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA PRINCIPAL - LISTA DE SEMINARIOS/SERIES */
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('seminars')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'seminars'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiBook className="inline mr-2" />
                  Seminarios ({seminars.length})
                </button>
                <button
                  onClick={() => setActiveTab('series')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'series'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiList className="inline mr-2" />
                  Series ({series.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {currentData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    {activeTab === 'seminars' ? <FiBook /> : <FiList />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay {activeTab === 'seminars' ? 'seminarios' : 'series'} creados
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Usa el botón "Crear {activeTab === 'seminars' ? 'Seminario' : 'Serie'}" en la parte superior para comenzar
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentData.map((container) => (
                    <div
                      key={container.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                    >
                      {/* Header de la tarjeta */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {container.title}
                          </h3>
                          {container.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {container.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {container.lessons.length}
                          </div>
                          <div className="text-xs text-blue-700">Lecciones</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {container.audioFiles.length}
                          </div>
                          <div className="text-xs text-green-700">Archivos MP3</div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditLessons(container)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <FiEdit className="mr-1" />
                          Editar Contenido
                        </button>
                        <button
                          onClick={() => handleDeleteContainer(container.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      {/* Lista compacta de lecciones */}
                      {container.lessons.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase">Lecciones:</h4>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {container.lessons.slice(0, 3).map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex justify-between items-center text-xs"
                              >
                                <span className="text-gray-700 truncate">
                                  {lesson.order}. {lesson.title}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  {lesson.fragments?.length || 0}
                                </span>
                              </div>
                            ))}
                            {container.lessons.length > 3 && (
                              <div className="text-xs text-gray-500 italic">
                                +{container.lessons.length - 3} más...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
