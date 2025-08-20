// Tipos para archivos de audio
export interface AudioFile {
  id: string;
  name: string;               // Nombre personalizado del archivo
  url?: string;               // URL remota (opcional)
  file?: File;                // Archivo local (opcional)
  type: 'local' | 'remote';   // Tipo de fuente
}

// Tipos para diapositivas
export interface Slide {
  id: string;
  title: string;
  content: string;      // Contenido HTML de la diapositiva
  order: number;
}

// Tipos para videos embebidos de YouTube
export interface Video {
  id: string;
  title: string;
  youtubeId: string;    // ID del video de YouTube (ej: "dQw4w9WgXcQ")
  description?: string;
  order: number;
}

// Fragmento: unidad básica de contenido dentro de una lección
export interface Fragment {
  id: string;
  order: number;
  readingMaterial: string;    // Material de lectura/estudio
  slides: Slide[];            // Array de diapositivas
  videos: Video[];            // Array de videos embebidos
  studyAids: string;          // Ayudas y materiales de apoyo
  narrationAudio?: AudioFile; // Audio de narración para este fragmento
  isCollapsed?: boolean;      // Para el estado de colapso visual
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  containerId: string; // Puede ser seminarId o seriesId
  containerType: 'seminar' | 'series';
  order: number;
  fragments: Fragment[];      // Array de fragmentos que componen la lección
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Seminar {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
  audioFiles: AudioFile[];    // Pistas musicales del seminario (con nombres)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Series {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
  audioFiles: AudioFile[];    // Pistas musicales de la serie (con nombres)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudyContainer {
  id: string;
  title: string;
  description?: string;
  type: 'seminar' | 'series';
  lessons: Lesson[];
  order: number;
  audioFiles: AudioFile[];    // Pistas musicales disponibles (con nombres)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Note {
  id: string;
  content: string;
  userId: string;
  isShared: boolean;
  type: 'direct' | 'selection' | 'imported'; // Tipo de nota
  selectedText?: string;    // Texto seleccionado (para notas de selección)
  position?: {              // Posición del texto seleccionado
    start: number;
    end: number;
  };
  createdAt: Date;
  updatedAt: Date;
  contentHtml?: string; // nuevo campo para contenido enriquecido
    fragmentId?: string;   // Asociada al fragmento específico
}

export interface SharedNote {
  id: string;
  noteId: string;
  content: string;          // Contenido de la nota compartida
  authorName: string;
  selectedText?: string;    // Texto seleccionado original
  comment?: string;
  lessonTitle: string;
  seminarTitle: string;
  fragmentOrder: number;    // Orden del fragmento
  sharedAt: Date;
}

// Popup para selección de texto
export interface TextSelectionPopup {
  isVisible: boolean;
  selectedText: string;
  position: {
    x: number;
    y: number;
  };
  fragmentId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user'; // Roles para permisos
  createdAt: Date;
}
