"use client";

import { useState } from "react";
import { Seminar, Series, StudyContainer, Fragment, AudioFile } from "@/types";
import { AdminPanelState, CreationForm, ActiveTab } from "../types";
import type {
  DbSeminar,
  DbSeries,
  DbFragment,
  DbSlide,
  DbVideo,
} from "@/types/db";
import { dbSeminarToUi, dbSeriesToUi } from "@/types/db";
import {
  createSeminarFromAdminForm,
  createSeriesFromAdminForm,
} from "@/actions/admin/create-serie-or-seminar";
import { submitAlert } from "@/utils/alerts";
import { deleteSeminarOrSerie } from "@/actions/admin/delete-seminar-or-serie";
import Swal from "sweetalert2";
import {
  addFragment as addFragmentAction,
  removeFragment as removeFragmentAction,
  updateFragment as updateFragmentAction,
  reorderFragments as reorderFragmentsAction,
} from "@/actions/admin/fragments/crud";
import { updateLessonTitle as updateLessonTitleAction } from "@/actions/admin/lessons/update-title";
import {
  updateSeminarTitle,
  updateSeriesTitle,
} from "@/actions/admin/update-serie-seminar-title";
import { useAuth } from "@/context/AuthContext";

type InitData = {
  initialSeminars?: DbSeminar[];
  initialSeries?: DbSeries[];
};

export function useAdminPanel(init?: InitData) {
  // Current user
  const { user } = useAuth();

  // Use shared mappers from db.ts instead of local ones
  const [seminars, setSeminars] = useState<Seminar[]>(
    (init?.initialSeminars ?? []).map(dbSeminarToUi)
  );
  const [series, setSeries] = useState<Series[]>(
    (init?.initialSeries ?? []).map(dbSeriesToUi)
  );

  const [state, setState] = useState<AdminPanelState>({
    activeTab: "seminars",
    isCreatingContainer: false,
    isEditingLessons: false,
    selectedLessonIndex: 0,
    editingContainer: null,
    creationForm: {
      title: "",
      description: "",
      lessonsCount: 10,
      lessons: Array.from({ length: 10 }, (_, i) => ({
        title: "",
        order: i + 1,
      })),
      audioFiles: [],
    },
    fragmentsData: [],
    editingFragmentIndex: null,
  });

  // Loading flags
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingFragments, setIsSavingFragments] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddingFragment, setIsAddingFragment] = useState(false);

  const currentData = state.activeTab === "seminars" ? seminars : series;

  // ============== FUNCIONES PARA MANEJO DE CONTENEDORES ==============

  const resetCreationForm = () => {
    const defaultForm: CreationForm = {
      title: "",
      description: "",
      lessonsCount: 10,
      lessons: Array.from({ length: 10 }, (_, i) => ({
        title: "",
        order: i + 1,
      })),
      audioFiles: [],
    };

    setState((prev) => ({
      ...prev,
      creationForm: defaultForm,
    }));
  };

  const handleCreateContainer = () => {
    setState((prev) => ({ ...prev, isCreatingContainer: true }));
    resetCreationForm();
  };

  const handleCancelCreation = () => {
    setState((prev) => ({ ...prev, isCreatingContainer: false }));
  };

  const handleLessonsCountChange = (count: number) => {
    const lessons = Array.from({ length: count }, (_, i) => {
      const existingLesson = state.creationForm.lessons[i];
      return existingLesson || { title: "", order: i + 1 };
    });

    setState((prev) => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        lessonsCount: count,
        lessons,
      },
    }));
  };

  const handleLessonTitleChange = (index: number, title: string) => {
    const updatedLessons = [...state.creationForm.lessons];
    updatedLessons[index] = { ...updatedLessons[index], title };

    setState((prev) => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        lessons: updatedLessons,
      },
    }));
  };

  const handleFormFieldChange = (
    field: keyof CreationForm,
    value: string | number | AudioFile[]
  ) => {
    setState((prev) => ({
      ...prev,
      creationForm: {
        ...prev.creationForm,
        [field]: value,
      },
    }));
  };

  const handleSaveContainer = async () => {
    if (isSavingCreate) return;
    if (!state.creationForm.title.trim()) {
      submitAlert("El título es obligatorio", "error");
      return;
    }

    if (state.creationForm.lessons.some((lesson) => !lesson.title.trim())) {
      submitAlert(
        "Todos los títulos de las lecciones son obligatorios",
        "error"
      );
      return;
    }

    if (state.activeTab === "seminars") {
      // Persist via Server Action (Prisma)
      try {
        setIsSavingCreate(true);
        // Sanitize non-serializable fields (File) from audioFiles
        const sanitizedForm: CreationForm = {
          ...state.creationForm,
          audioFiles: (state.creationForm.audioFiles ?? []).map(
            (a) =>
              ({
                id: a.id,
                name: a.name,
                url: a.url,
                type: a.type,
              } as AudioFile)
          ),
        };

        const result = await createSeminarFromAdminForm(
          {
            ...sanitizedForm,
            // Ensure lesson titles and orders are trimmed/sequenced
            lessons: sanitizedForm.lessons.map((l, idx) => ({
              title: l.title.trim(),
              order: l.order ?? idx + 1,
            })),
            title: sanitizedForm.title.trim(),
            description: sanitizedForm.description.trim(),
          },
          user?.id
        );

        if (result.ok && result.seminar) {
          const s = result.seminar as DbSeminar;
          const prismaSeminar: Seminar = dbSeminarToUi(s);
          const updatedSeminars = [...seminars, prismaSeminar];
          setSeminars(updatedSeminars);
          // Solo cerrar el formulario y resetear si fue exitoso
          setState((prev) => ({ ...prev, isCreatingContainer: false }));
          resetCreationForm();
          submitAlert("Seminario creado exitosamente", "success");
        } else {
          console.error("Error creando seminario:", result.error);
          submitAlert(result.message || "Error creando seminario", "error");
          // No cerrar el formulario ni resetear cuando hay error
          return;
        }
      } catch (e) {
        console.error("Error creando seminario en backend", e);
        submitAlert("Error creando seminario", "error");
        // No cerrar el formulario ni resetear cuando hay error
        return;
      } finally {
        setIsSavingCreate(false);
      }
    } else {
      // Series: persist via Server Action as well
      try {
        setIsSavingCreate(true);
        const sanitizedForm: CreationForm = {
          ...state.creationForm,
          audioFiles: (state.creationForm.audioFiles ?? []).map(
            (a) =>
              ({
                id: a.id,
                name: a.name,
                url: a.url,
                type: a.type,
              } as AudioFile)
          ),
        };

        const result = await createSeriesFromAdminForm(
          {
            ...sanitizedForm,
            lessons: sanitizedForm.lessons.map((l, idx) => ({
              title: l.title.trim(),
              order: l.order ?? idx + 1,
            })),
            title: sanitizedForm.title.trim(),
            description: sanitizedForm.description.trim(),
          },
          user?.id
        );

        if (result.ok && (result as { series?: DbSeries }).series) {
          const s = (result as { series: DbSeries }).series;
          const prismaSeries: Series = dbSeriesToUi(s);
          const updatedSeries = [...series, prismaSeries];
          setSeries(updatedSeries);
          // Solo cerrar el formulario y resetear si fue exitoso
          setState((prev) => ({ ...prev, isCreatingContainer: false }));
          resetCreationForm();
          submitAlert("Serie creada exitosamente", "success");
        } else {
          console.error("Error creando serie:", result.error);
          submitAlert(result.message || "Error creando serie", "error");
          // No cerrar el formulario ni resetear cuando hay error
          return;
        }
      } catch (e) {
        console.error("Error creando serie en backend", e);
        submitAlert("Error creando serie", "error");
        // No cerrar el formulario ni resetear cuando hay error
        return;
      } finally {
        setIsSavingCreate(false);
      }
    }
  };

  const handleEditLessons = (container: Seminar | Series) => {
    const studyContainer: StudyContainer = {
      ...container,
      type: container.id.includes("seminar") ? "seminar" : "series",
    };

    setState((prev) => ({
      ...prev,
      editingContainer: studyContainer,
      isEditingLessons: true,
      selectedLessonIndex: 0,
      fragmentsData: container.lessons[0]?.fragments || [],
      editingFragmentIndex: null,
    }));
  };

  const handleSelectLesson = (index: number) => {
    if (!state.editingContainer) return;

    const selectedLesson = state.editingContainer.lessons[index];
    setState((prev) => ({
      ...prev,
      selectedLessonIndex: index,
      fragmentsData: selectedLesson?.fragments || [],
      editingFragmentIndex: null,
    }));
  };

  const onUpdateLessonTitle = async (lessonId: string, title: string) => {
    try {
      const res = await updateLessonTitleAction(lessonId, title, user?.id);
      if (!res.ok) throw new Error(res.message || "Error actualizando título");
      const updater = (list: (Seminar | Series)[]) =>
        list.map((c) => ({
          ...c,
          lessons: c.lessons.map((l) =>
            l.id === lessonId ? { ...l, title } : l
          ),
        }));
      setSeminars((prev) => updater(prev));
      setSeries((prev) => updater(prev));
      setState((prev) => {
        if (!prev.editingContainer) return prev;
        const updated: StudyContainer = {
          ...prev.editingContainer,
          lessons: prev.editingContainer.lessons.map((l) =>
            l.id === lessonId ? { ...l, title } : l
          ),
        };
        return { ...prev, editingContainer: updated };
      });
      submitAlert("Título actualizado", "success");
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Error actualizando título de lección", error);
      submitAlert(error.message || "No se pudo actualizar el título", "error");
    }
  };

  const handleFinishEditingLessons = () => {
    setState((prev) => ({
      ...prev,
      isEditingLessons: false,
      editingContainer: null,
      fragmentsData: [],
      editingFragmentIndex: null,
    }));
  };

  const onUpdateContainerTitle = async (containerId: string, title: string) => {
    try {
      const trimmed = title.trim();
      if (!trimmed) return;
      // Detect type by current tab or by editingContainer
      const isSeminar =
        state.activeTab === "seminars" ||
        state.editingContainer?.type === "seminar";
      const res = isSeminar
        ? await updateSeminarTitle(containerId, trimmed, user?.id)
        : await updateSeriesTitle(containerId, trimmed, user?.id);
      if (!res.ok) throw new Error(res.message || "Error actualizando título");
      if (isSeminar) {
        setSeminars((prev) =>
          prev.map((s) => (s.id === containerId ? { ...s, title: trimmed } : s))
        );
      } else {
        setSeries((prev) =>
          prev.map((s) => (s.id === containerId ? { ...s, title: trimmed } : s))
        );
      }
      setState((prev) => {
        if (!prev.editingContainer) return prev;
        if (prev.editingContainer.id !== containerId) return prev;
        return {
          ...prev,
          editingContainer: { ...prev.editingContainer, title: trimmed },
        };
      });
      submitAlert("Título actualizado", "success");
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Error actualizando título de contenedor", error);
      submitAlert(error.message || "No se pudo actualizar el título", "error");
    }
  };

  const handleDeleteContainer = async (id: string) => {
    // Confirmación amigable
    const result = await Swal.fire({
      title: "¿Eliminar este contenedor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      // Nota: submitAlert no devuelve promesa de confirmación. Si se requiere confirm explícito con botón, habría que usar Swal directamente.
      // Procedemos con eliminación directa por simplicidad, ya que el patrón actual de submitAlert no soporta confirm.
      try {
        setDeletingId(id);
        const res = await deleteSeminarOrSerie(id, user?.id);
        if (!res.ok)
          throw new Error(
            (res as { error?: string }).error || "Error al eliminar"
          );

        if (res.type === "seminar") {
          const updatedSeminars = seminars.filter((s) => s.id !== id);
          setSeminars(updatedSeminars);
        } else if (res.type === "series") {
          const updatedSeries = series.filter((s) => s.id !== id);
          setSeries(updatedSeries);
        }

        submitAlert("Eliminado correctamente", "success");
      } catch (e: unknown) {
        const error = e as Error;
        console.error("Error eliminando contenedor", error);
        submitAlert(error.message || "Error eliminando contenedor", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // ============== FUNCIONES PARA MANEJO DE FRAGMENTOS ==============

  const addFragment = async () => {
    if (!state.editingContainer) return;
    const currentLesson =
      state.editingContainer.lessons[state.selectedLessonIndex];
    setIsAddingFragment(true);
    const res = await addFragmentAction(currentLesson.id, user?.id);
    if (res.ok) {
      const f = res.fragment as DbFragment;
      const mapped: Fragment = {
        id: f.id,
        order: f.order,
        readingMaterial: f.readingMaterial,
        slides: (f.slides ?? []).map((sl: DbSlide) => ({
          id: sl.id,
          title: sl.title,
          content: sl.content,
          order: sl.order,
        })),
        videos: (f.videos ?? []).map((v: DbVideo) => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          description: v.description ?? undefined,
          order: v.order,
        })),
        studyAids: f.studyAids,
        narrationAudio: undefined,
        isCollapsed: f.isCollapsed ?? false,
      };
      setState((prev) => ({
        ...prev,
        fragmentsData: [...prev.fragmentsData, mapped],
      }));
    } else {
      submitAlert(res.message || "No se pudo agregar el fragmento", "error");
    }
    setIsAddingFragment(false);
  };

  const removeFragment = async (fragmentIndex: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de que deseas eliminar este fragmento?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    const fragment = state.fragmentsData[fragmentIndex];
    if (!fragment) return;
    const res = await removeFragmentAction(fragment.id, user?.id);
    if (res.ok) {
      const updatedFragments = state.fragmentsData.filter(
        (_, index) => index !== fragmentIndex
      );
      // Reordenar localmente
      updatedFragments.forEach((f, idx) => (f.order = idx + 1));
      setState((prev) => ({
        ...prev,
        fragmentsData: updatedFragments,
        editingFragmentIndex: null,
      }));
      // Persist reordering
      const orderedIds = updatedFragments.map((f) => f.id);
      const currentLesson =
        state.editingContainer!.lessons[state.selectedLessonIndex];
      await reorderFragmentsAction(currentLesson.id, orderedIds);
    } else {
      submitAlert(res.message || "No se pudo eliminar el fragmento", "error");
    }
  };

  const saveFragmentsToLesson = async () => {
    if (!state.editingContainer) return;
    setIsSavingFragments(true);
    let unauthorizedAction: string | null = null;
    try {
      // Persist updates for each fragment basic fields
      for (const f of state.fragmentsData) {
        const res = await updateFragmentAction(
          f.id,
          {
            readingMaterial: f.readingMaterial,
            studyAids: f.studyAids,
            isCollapsed: f.isCollapsed ?? false,
          },
          user?.id
        );
        if (!res.ok) {
          unauthorizedAction =
            res.message || `Error actualizando fragmento ${f.order}`;
          throw new Error(unauthorizedAction);
        } else {
          unauthorizedAction = null;
        }
      }
      // Persist order
      const currentLesson =
        state.editingContainer.lessons[state.selectedLessonIndex];
      const orderedIds = state.fragmentsData.map((f) => f.id);
      await reorderFragmentsAction(currentLesson.id, orderedIds);

      // Reflect local edit container
      const updatedContainer = { ...state.editingContainer };
      updatedContainer.lessons[state.selectedLessonIndex].fragments =
        state.fragmentsData;
      if (state.activeTab === "seminars") {
        const updatedSeminars = seminars.map((s) =>
          s.id === updatedContainer.id ? updatedContainer : s
        );
        setSeminars(updatedSeminars);
      } else {
        const updatedSeries = series.map((s) =>
          s.id === updatedContainer.id ? updatedContainer : s
        );
        setSeries(updatedSeries);
      }
      setState((prev) => ({ ...prev, editingContainer: updatedContainer }));
      submitAlert("Fragmentos guardados", "success");
    } catch (e) {
      console.error("Error guardando fragmentos", e);
      submitAlert(
        unauthorizedAction || "No se pudieron guardar los fragmentos",
        "error"
      );
    } finally {
      setIsSavingFragments(false);
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  return {
    state: {
      ...state,
      seminars,
      series,
      currentData,
      isSavingCreate,
      isSavingFragments,
      deletingId,
      isAddingFragment,
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
      onUpdateLessonTitle,
      handleSelectLesson,
      handleFinishEditingLessons,
      handleDeleteContainer,
      onUpdateContainerTitle,
      addFragment,
      removeFragment,
      saveFragmentsToLesson,
      setState,
    },
  };
}
