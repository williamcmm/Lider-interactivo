import { AudioFile, Fragment, Seminar, Series, StudyContainer } from "@/types";


export interface CreationForm {
  title: string;
  description: string;
  lessonsCount: number;
  lessons: { title: string; order: number }[];
  audioFiles: AudioFile[];
}

export type ActiveTab = 'seminars' | 'series';

export interface AdminPanelState {
  activeTab: ActiveTab;
  isCreatingContainer: boolean;
  isEditingLessons: boolean;
  selectedLessonIndex: number;
  editingContainer: StudyContainer | null;
  creationForm: CreationForm;
  fragmentsData: Fragment[];
  editingFragmentIndex: number | null;
}

export interface ContainerCardProps {
  container: Seminar | Series;
  type: 'seminar' | 'series';
  onEdit: (container: Seminar | Series) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export interface CreationFormProps {
  form: CreationForm;
  type: ActiveTab;
  onFormChange: (form: CreationForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export interface LessonEditorProps {
  container: StudyContainer;
  selectedLessonIndex: number;
  fragments: Fragment[];
  editingFragmentIndex: number | null;
  onSelectLesson: (index: number) => void;
  onUpdateContainerTitle?: (containerId: string, title: string) => Promise<void> | void;
  onUpdateLessonTitle: (lessonId: string, title: string) => Promise<void> | void;
  onFragmentEdit: (index: number | null) => void;
  onFragmentUpdate: (fragments: Fragment[]) => void;
  onAddFragment: () => void;
  onRemoveFragment: (index: number) => void;
  onSaveFragments: () => void;
  onFinish: () => void;
  isSaving?: boolean;
  isAddingFragment?: boolean;
}

export interface FragmentEditorProps {
  fragment: Fragment;
  index: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onUpdate: (index: number, field: string, value: string | AudioFile | undefined) => void;
  onRemove: (index: number) => void;
  onAddSlide: (fragmentIndex: number) => void;
  onUpdateSlide: (fragmentIndex: number, slideIndex: number, field: string, value: string) => void;
  onRemoveSlide: (fragmentIndex: number, slideIndex: number) => void;
  onAddVideo: (fragmentIndex: number) => void;
  onUpdateVideo: (fragmentIndex: number, videoIndex: number, field: string, value: string) => void;
  onRemoveVideo: (fragmentIndex: number, videoIndex: number) => void;
}
