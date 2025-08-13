"use client";
import { useState, useEffect } from 'react';
import { Seminar, Series, StudyContainer, Fragment, AudioFile } from '@/types';
import { LocalStorage } from '@/lib/storage';
import { AdminPanelState, CreationForm, ActiveTab } from '../types';

export function useAdminPanel() {
  const [state, setState] = useState<AdminPanelState>({
    activeTab: 'seminars',
    isCreatingContainer: false,
    isEditingLessons: false,
    selectedLessonIndex: 0,
    editingContainer: null,
    creationForm: {
      title: '',
      description: '',
      lessonsCount: 10,
      lessons: Array.from({ length: 10 }, (_, i) => ({ title: '', order: i + 1 })),
      audioFiles: []
    },
    fragmentsData: [],
    editingFragmentIndex: null
  });

  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    const storedSeminars = LocalStorage.getSeminars();
    const storedSeries = LocalStorage.getSeries();
    
    setSeminars(storedSeminars);
    setSeries(storedSeries);
  }, []);

  const currentData = state.activeTab === 'seminars' ? seminars : series;

  // ============== FUNCIONES PARA MANEJO DE CONTENEDORES ==============

  const resetCreationForm = () => {
    const defaultForm: CreationForm = {
      title: '',
      description: '',
      lessonsCount: 10,
      lessons: Array.from({ length: 10 }, (_, i) => ({ title: '', order: i + 1 })),
      audioFiles: []
    };
    
    setState(prev => ({
      ...prev,
      creationForm: defaultForm
    }));
  };

  const handleCreateContainer = () => {
    setState(prev => ({ ...prev, isCreatingContainer: true }));
    resetCreationForm();
  };

  const handleCancelCreation = () => {
    setState(prev => ({ ...prev, isCreatingContainer: false }));
  };

  const handleLessonsCountChange = (count: number) => {
    const lessons = Array.from({ length: count }, (_, i) => {
      const existingLesson = state.creationForm.lessons[i];
      return existingLesson || { title: '', order: i + 1 };
    });

    setState(prev => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        lessonsCount: count,
        lessons
      }
    }));
  };

  const handleLessonTitleChange = (index: number, title: string) => {
    const updatedLessons = [...state.creationForm.lessons];
    updatedLessons[index] = { ...updatedLessons[index], title };
    
    setState(prev => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        lessons: updatedLessons
      }
    }));
  };

  const handleFormFieldChange = (field: keyof CreationForm, value: any) => {
    setState(prev => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        [field]: value
      }
    }));
  };

  const handleSaveContainer = () => {
    if (!state.creationForm.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (state.creationForm.lessons.some(lesson => !lesson.title.trim())) {
      alert('Todos los títulos de las lecciones son obligatorios');
      return;
    }

    const newContainer: StudyContainer = {
      id: `${state.activeTab.slice(0, -1)}_${Date.now()}`,
      title: state.creationForm.title.trim(),
      description: state.creationForm.description.trim(),
      type: state.activeTab === 'seminars' ? 'seminar' : 'series',
      order: currentData.length + 1,
      lessons: state.creationForm.lessons.map((lesson, index) => ({
        id: `lesson_${Date.now()}_${index}`,
        title: lesson.title.trim(),
        content: 'Contenido por defecto...',
        containerId: `${state.activeTab.slice(0, -1)}_${Date.now()}`,
        containerType: state.activeTab === 'seminars' ? 'seminar' : 'series' as 'seminar' | 'series',
        order: index + 1,
        fragments: [
          {
            id: `fragment_${Date.now()}_${index}_0`,
            order: 1,
            readingMaterial: 'Contenido de lectura por defecto...',
            slides: [{
              id: `slide_${Date.now()}_${index}_0_0`,
              order: 1,
              title: 'Diapositiva por defecto',
              content: '<h2>Título de la diapositiva</h2><p>Contenido de la diapositiva...</p>'
            }],
            videos: [{
              id: `video_${Date.now()}_${index}_0_0`,
              order: 1,
              title: 'Video de ejemplo',
              youtubeId: 'dQw4w9WgXcQ',
              description: 'Descripción del video...'
            }],
            studyAids: 'Ayudas de estudio por defecto...',
            narrationAudio: undefined
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      audioFiles: state.creationForm.audioFiles,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (state.activeTab === 'seminars') {
      const updatedSeminars = [...seminars, newContainer as Seminar];
      setSeminars(updatedSeminars);
      LocalStorage.saveSeminars(updatedSeminars);
    } else {
      const updatedSeries = [...series, newContainer as Series];
      setSeries(updatedSeries);
      LocalStorage.saveSeries(updatedSeries);
    }

    setState(prev => ({ ...prev, isCreatingContainer: false }));
    resetCreationForm();
  };

  const handleEditLessons = (container: Seminar | Series) => {
    const studyContainer: StudyContainer = {
      ...container,
      type: container.id.includes('seminar') ? 'seminar' : 'series'
    };
    
    setState(prev => ({
      ...prev,
      editingContainer: studyContainer,
      isEditingLessons: true,
      selectedLessonIndex: 0,
      fragmentsData: container.lessons[0]?.fragments || [],
      editingFragmentIndex: null
    }));
  };

  const handleSelectLesson = (index: number) => {
    if (!state.editingContainer) return;
    
    const selectedLesson = state.editingContainer.lessons[index];
    setState(prev => ({
      ...prev,
      selectedLessonIndex: index,
      fragmentsData: selectedLesson?.fragments || [],
      editingFragmentIndex: null
    }));
  };

  const handleFinishEditingLessons = () => {
    setState(prev => ({
      ...prev,
      isEditingLessons: false,
      editingContainer: null,
      fragmentsData: [],
      editingFragmentIndex: null
    }));
  };

  const handleDeleteContainer = (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contenedor?')) return;

    if (state.activeTab === 'seminars') {
      const updatedSeminars = seminars.filter(s => s.id !== id);
      setSeminars(updatedSeminars);
      LocalStorage.saveSeminars(updatedSeminars);
    } else {
      const updatedSeries = series.filter(s => s.id !== id);
      setSeries(updatedSeries);
      LocalStorage.saveSeries(updatedSeries);
    }
  };

  // ============== FUNCIONES PARA MANEJO DE FRAGMENTOS ==============

  const addFragment = () => {
    if (!state.editingContainer) return;

    const newFragment = {
      id: `fragment_${Date.now()}`,
      order: state.fragmentsData.length + 1,
      readingMaterial: 'Nuevo contenido de lectura...',
      slides: [{
        id: `slide_${Date.now()}_0`,
        order: 1,
        title: 'Nueva Diapositiva',
        content: '<h2>Título de la nueva diapositiva</h2><p>Contenido...</p>'
      }],
      videos: [],
      studyAids: 'Nuevas ayudas de estudio...',
      narrationAudio: undefined
    };

    const updatedFragments = [...state.fragmentsData, newFragment];
    setState(prev => ({ ...prev, fragmentsData: updatedFragments }));
  };

  const removeFragment = (fragmentIndex: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este fragmento?')) return;

    const updatedFragments = state.fragmentsData.filter((_, index) => index !== fragmentIndex);
    
    // Reordenar los fragmentos restantes
    updatedFragments.forEach((fragment, index) => {
      fragment.order = index + 1;
    });

    setState(prev => ({
      ...prev,
      fragmentsData: updatedFragments,
      editingFragmentIndex: null
    }));
  };

  const saveFragmentsToLesson = () => {
    if (!state.editingContainer) return;

    // Actualizar los fragmentos en la lección actual
    const updatedContainer = { ...state.editingContainer };
    updatedContainer.lessons[state.selectedLessonIndex].fragments = state.fragmentsData;

    // Guardar en localStorage
    if (state.activeTab === 'seminars') {
      const updatedSeminars = seminars.map(s => 
        s.id === updatedContainer.id ? updatedContainer : s
      );
      setSeminars(updatedSeminars);
      LocalStorage.saveSeminars(updatedSeminars);
    } else {
      const updatedSeries = series.map(s => 
        s.id === updatedContainer.id ? updatedContainer : s
      );
      setSeries(updatedSeries);
      LocalStorage.saveSeries(updatedSeries);
    }

    setState(prev => ({ ...prev, editingContainer: updatedContainer }));
  };

  const setActiveTab = (tab: ActiveTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  return {
    state: {
      ...state,
      seminars,
      series,
      currentData
    },
    actions: {
      setActiveTab,
      handleCreateContainer,
      handleCancelCreation,
      handleLessonsCountChange,
      handleLessonTitleChange,
      handleFormFieldChange,
      handleSaveContainer,
      handleEditLessons,
      handleSelectLesson,
      handleFinishEditingLessons,
      handleDeleteContainer,
      addFragment,
      removeFragment,
      saveFragmentsToLesson,
      setState
    }
  };
}
