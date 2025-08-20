"use client";

import { useState } from "react";
import { Seminar, Series, StudyContainer, Fragment, AudioFile } from "@/types";
import { AdminPanelState, CreationForm, ActiveTab } from "../types";
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

type InitData = { initialSeminars?: any[]; initialSeries?: any[] };

export function useAdminPanel(init?: InitData) {
  // Helpers to map DB payload to UI types
  const mapAudioType = (t: any): AudioFile["type"] =>
    String(t || "").toLowerCase() === "local" ? "local" : "remote";

  const toUiSeminar = (s: any): Seminar => ({
    id: s.id,
    title: s.title,
    description: s.description ?? undefined,
    order: s.order,
    createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    audioFiles: (s.audioFiles ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      url: a.url ?? undefined,
      type: mapAudioType(a.type),
    })),
    lessons: (s.lessons ?? []).map((l: any) => ({
      id: l.id,
      title: l.title,
      content: l.content,
      containerId: s.id,
      containerType: "seminar",
      order: l.order,
      fragments: (l.fragments ?? []).map((f: any) => ({
        id: f.id,
        order: f.order,
        readingMaterial: f.readingMaterial,
        slides: (f.slides ?? []).map((sl: any) => ({
          id: sl.id,
          title: sl.title,
          content: sl.content,
          order: sl.order,
        })),
        videos: (f.videos ?? []).map((v: any) => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          description: v.description ?? undefined,
          order: v.order,
        })),
        studyAids: f.studyAids,
        narrationAudio: f.narrationAudio
          ? {
              id: f.narrationAudio.id,
              name: f.narrationAudio.name,
              url: f.narrationAudio.url ?? undefined,
              type: mapAudioType(f.narrationAudio.type),
            }
          : undefined,
        isCollapsed: f.isCollapsed ?? false,
      })),
      createdAt: l.createdAt ? new Date(l.createdAt) : undefined,
      updatedAt: l.updatedAt ? new Date(l.updatedAt) : undefined,
    })),
  });

  const toUiSeries = (s: any): Series => ({
    id: s.id,
    title: s.title,
    description: s.description ?? undefined,
    order: s.order,
    createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    audioFiles: (s.audioFiles ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      url: a.url ?? undefined,
      type: mapAudioType(a.type),
    })),
    lessons: (s.lessons ?? []).map((l: any) => ({
      id: l.id,
      title: l.title,
      content: l.content,
      containerId: s.id,
      containerType: "series",
      order: l.order,
      fragments: (l.fragments ?? []).map((f: any) => ({
        id: f.id,
        order: f.order,
        readingMaterial: f.readingMaterial,
        slides: (f.slides ?? []).map((sl: any) => ({
          id: sl.id,
          title: sl.title,
          content: sl.content,
          order: sl.order,
        })),
        videos: (f.videos ?? []).map((v: any) => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          description: v.description ?? undefined,
          order: v.order,
        })),
        studyAids: f.studyAids,
        narrationAudio: f.narrationAudio
          ? {
              id: f.narrationAudio.id,
              name: f.narrationAudio.name,
              url: f.narrationAudio.url ?? undefined,
              type: mapAudioType(f.narrationAudio.type),
            }
          : undefined,
        isCollapsed: f.isCollapsed ?? false,
      })),
      createdAt: l.createdAt ? new Date(l.createdAt) : undefined,
      updatedAt: l.updatedAt ? new Date(l.updatedAt) : undefined,
    })),
  });
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

  const [seminars, setSeminars] = useState<Seminar[]>(
    (init?.initialSeminars ?? []).map(toUiSeminar)
  );
  const [series, setSeries] = useState<Series[]>(
    (init?.initialSeries ?? []).map(toUiSeries)
  );
  // Loading flags
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingFragments, setIsSavingFragments] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleFormFieldChange = (field: keyof CreationForm, value: any) => {
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
      alert("El título es obligatorio");
      return;
    }

    if (state.creationForm.lessons.some((lesson) => !lesson.title.trim())) {
      alert("Todos los títulos de las lecciones son obligatorios");
      return;
    }

    const newContainer: StudyContainer = {
      id: `${state.activeTab.slice(0, -1)}_${Date.now()}`,
      title: state.creationForm.title.trim(),
      description: state.creationForm.description.trim(),
      type: state.activeTab === "seminars" ? "seminar" : "series",
      order: currentData.length + 1,
      lessons: state.creationForm.lessons.map((lesson, index) => ({
        id: `lesson_${Date.now()}_${index}`,
        title: lesson.title.trim(),
        content: "Contenido por defecto...",
        containerId: `${state.activeTab.slice(0, -1)}_${Date.now()}`,
        containerType:
          state.activeTab === "seminars"
            ? "seminar"
            : ("series" as "seminar" | "series"),
        order: index + 1,
        fragments: [
          {
            id: `fragment_${Date.now()}_${index}_0`,
            order: 1,
            readingMaterial: "Contenido de lectura por defecto...",
            slides: [
              {
                id: `slide_${Date.now()}_${index}_0_0`,
                order: 1,
                title: "Diapositiva por defecto",
                content:
                  "<h2>Título de la diapositiva</h2><p>Contenido de la diapositiva...</p>",
              },
            ],
            videos: [
              {
                id: `video_${Date.now()}_${index}_0_0`,
                order: 1,
                title: "Video de ejemplo",
                youtubeId: "dQw4w9WgXcQ",
                description: "Descripción del video...",
              },
            ],
            studyAids: "Ayudas de estudio por defecto...",
            narrationAudio: undefined,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      audioFiles: state.creationForm.audioFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

        const result = await createSeminarFromAdminForm({
          ...sanitizedForm,
          // Ensure lesson titles and orders are trimmed/sequenced
          lessons: sanitizedForm.lessons.map((l, idx) => ({
            title: l.title.trim(),
            order: l.order ?? idx + 1,
          })),
          title: sanitizedForm.title.trim(),
          description: sanitizedForm.description.trim(),
        });

        if (result.ok && result.seminar) {
          const s = result.seminar as any;
          const prismaSeminar: Seminar = {
            id: s.id,
            title: s.title,
            description: s.description ?? undefined,
            order: s.order,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            audioFiles: (s.audioFiles ?? []).map((a: any) => ({
              id: a.id,
              name: a.name,
              url: a.url ?? undefined,
              type: (String(a.type || "").toLowerCase() === "local"
                ? "local"
                : "remote") as AudioFile["type"],
            })),
            lessons: (s.lessons ?? []).map((l: any) => ({
              id: l.id,
              title: l.title,
              content: l.content,
              containerId: s.id,
              containerType: "seminar",
              order: l.order,
              fragments: (l.fragments ?? []).map((f: any) => ({
                id: f.id,
                order: f.order,
                readingMaterial: f.readingMaterial,
                slides: (f.slides ?? []).map((sl: any) => ({
                  id: sl.id,
                  title: sl.title,
                  content: sl.content,
                  order: sl.order,
                })),
                videos: (f.videos ?? []).map((v: any) => ({
                  id: v.id,
                  title: v.title,
                  youtubeId: v.youtubeId,
                  description: v.description ?? undefined,
                  order: v.order,
                })),
                studyAids: f.studyAids,
                narrationAudio: f.narrationAudio
                  ? {
                      id: f.narrationAudio.id,
                      name: f.narrationAudio.name,
                      url: f.narrationAudio.url ?? undefined,
                      type: (String(
                        f.narrationAudio.type || ""
                      ).toLowerCase() === "local"
                        ? "local"
                        : "remote") as AudioFile["type"],
                    }
                  : undefined,
                isCollapsed: f.isCollapsed ?? false,
              })),
              createdAt: new Date(l.createdAt),
              updatedAt: new Date(l.updatedAt),
            })),
          };
          const updatedSeminars = [...seminars, prismaSeminar];
          setSeminars(updatedSeminars);
        } else {
          submitAlert(
            (result as any).error || "Error creando seminario",
            "error"
          );
          throw new Error((result as any).error || "Error creando seminario");
        }
      } catch (e) {
        console.error("Error creando seminario en backend", e);
        submitAlert("Error creando seminario", "error");
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

        const result = await createSeriesFromAdminForm({
          ...sanitizedForm,
          lessons: sanitizedForm.lessons.map((l, idx) => ({
            title: l.title.trim(),
            order: l.order ?? idx + 1,
          })),
          title: sanitizedForm.title.trim(),
          description: sanitizedForm.description.trim(),
        });

        if (result.ok && (result as any).series) {
          const s = (result as any).series;
          const prismaSeries: Series = {
            id: s.id,
            title: s.title,
            description: s.description ?? undefined,
            order: s.order,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            audioFiles: (s.audioFiles ?? []).map((a: any) => ({
              id: a.id,
              name: a.name,
              url: a.url ?? undefined,
              type: (String(a.type || "").toLowerCase() === "local"
                ? "local"
                : "remote") as AudioFile["type"],
            })),
            lessons: (s.lessons ?? []).map((l: any) => ({
              id: l.id,
              title: l.title,
              content: l.content,
              containerId: s.id,
              containerType: "series",
              order: l.order,
              fragments: (l.fragments ?? []).map((f: any) => ({
                id: f.id,
                order: f.order,
                readingMaterial: f.readingMaterial,
                slides: (f.slides ?? []).map((sl: any) => ({
                  id: sl.id,
                  title: sl.title,
                  content: sl.content,
                  order: sl.order,
                })),
                videos: (f.videos ?? []).map((v: any) => ({
                  id: v.id,
                  title: v.title,
                  youtubeId: v.youtubeId,
                  description: v.description ?? undefined,
                  order: v.order,
                })),
                studyAids: f.studyAids,
                narrationAudio: f.narrationAudio
                  ? {
                      id: f.narrationAudio.id,
                      name: f.narrationAudio.name,
                      url: f.narrationAudio.url ?? undefined,
                      type: (String(
                        f.narrationAudio.type || ""
                      ).toLowerCase() === "local"
                        ? "local"
                        : "remote") as AudioFile["type"],
                    }
                  : undefined,
                isCollapsed: f.isCollapsed ?? false,
              })),
              createdAt: new Date(l.createdAt),
              updatedAt: new Date(l.updatedAt),
            })),
          };
          const updatedSeries = [...series, prismaSeries];
          setSeries(updatedSeries);
        } else {
          submitAlert((result as any).error || "Error creando serie", "error");
          throw new Error((result as any).error || "Error creando serie");
        }
      } catch (e) {
        console.error("Error creando serie en backend", e);
        submitAlert("Error creando serie", "error");
      } finally {
        setIsSavingCreate(false);
      }
    }

    setState((prev) => ({ ...prev, isCreatingContainer: false }));
    resetCreationForm();
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

  const handleFinishEditingLessons = () => {
    setState((prev) => ({
      ...prev,
      isEditingLessons: false,
      editingContainer: null,
      fragmentsData: [],
      editingFragmentIndex: null,
    }));
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
        const res = await deleteSeminarOrSerie(id);
        if (!res.ok) throw new Error((res as any).error || "Error al eliminar");

        if (res.type === "seminar") {
          const updatedSeminars = seminars.filter((s) => s.id !== id);
          setSeminars(updatedSeminars);
        } else if (res.type === "series") {
          const updatedSeries = series.filter((s) => s.id !== id);
          setSeries(updatedSeries);
        }

        submitAlert("Eliminado correctamente", "success");
      } catch (e: any) {
        console.error("Error eliminando contenedor", e);
        submitAlert(e.message || "Error eliminando contenedor", "error");
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
    const res = await addFragmentAction(currentLesson.id);
    if (res.ok) {
      const f: any = res.fragment;
      const mapped: Fragment = {
        id: f.id,
        order: f.order,
        readingMaterial: f.readingMaterial,
        slides: (f.slides ?? []).map((sl: any) => ({
          id: sl.id,
          title: sl.title,
          content: sl.content,
          order: sl.order,
        })),
        videos: (f.videos ?? []).map((v: any) => ({
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
      submitAlert(
        (res as any).error || "No se pudo agregar el fragmento",
        "error"
      );
    }
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
    const res = await removeFragmentAction(fragment.id);
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
      submitAlert(
        (res as any).error || "No se pudo eliminar el fragmento",
        "error"
      );
    }
  };

  const saveFragmentsToLesson = async () => {
    if (!state.editingContainer) return;
    setIsSavingFragments(true);
    try {
      // Persist updates for each fragment basic fields
      for (const f of state.fragmentsData) {
        await updateFragmentAction(f.id, {
          readingMaterial: f.readingMaterial,
          studyAids: f.studyAids,
          isCollapsed: (f as any).isCollapsed ?? false,
        });
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
      submitAlert("No se pudieron guardar los fragmentos", "error");
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
      setState,
    },
  };
}
