/**
 * Sistema de persistencia local para seminarios y series
 * Utiliza localStorage para mantener los datos entre sesiones
 */

import { Seminar, Series, AudioFile } from '@/types';

const STORAGE_KEYS = {
  SEMINARS: 'lider-app-seminars',
  SERIES: 'lider-app-series'
} as const;

export class LocalStorage {
  // ============== MÉTODOS PARA SEMINARIOS ==============
  
  static getSeminars(): Seminar[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SEMINARS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar seminarios desde localStorage:', error);
      return [];
    }
  }

  static saveSeminars(seminars: Seminar[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SEMINARS, JSON.stringify(seminars));
    } catch (error) {
      console.error('Error al guardar seminarios en localStorage:', error);
    }
  }

  static addSeminar(seminar: Seminar): void {
    const seminars = this.getSeminars();
    seminars.push(seminar);
    this.saveSeminars(seminars);
  }

  static updateSeminar(updatedSeminar: Seminar): void {
    const seminars = this.getSeminars();
    const index = seminars.findIndex(s => s.id === updatedSeminar.id);
    if (index !== -1) {
      seminars[index] = updatedSeminar;
      this.saveSeminars(seminars);
    }
  }

  static deleteSeminar(seminarId: string): void {
    const seminars = this.getSeminars().filter(s => s.id !== seminarId);
    this.saveSeminars(seminars);
  }

  // ============== MÉTODOS PARA SERIES ==============
  
  static getSeries(): Series[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERIES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar series desde localStorage:', error);
      return [];
    }
  }

  static saveSeries(series: Series[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
    } catch (error) {
      console.error('Error al guardar series en localStorage:', error);
    }
  }

  static addSeries(series: Series): void {
    const allSeries = this.getSeries();
    allSeries.push(series);
    this.saveSeries(allSeries);
  }

  static updateSeries(updatedSeries: Series): void {
    const allSeries = this.getSeries();
    const index = allSeries.findIndex(s => s.id === updatedSeries.id);
    if (index !== -1) {
      allSeries[index] = updatedSeries;
      this.saveSeries(allSeries);
    }
  }

  static deleteSeries(seriesId: string): void {
    const allSeries = this.getSeries().filter(s => s.id !== seriesId);
    this.saveSeries(allSeries);
  }

  // ============== MÉTODOS UTILITARIOS ==============
  
  static getAllContent(): { seminars: Seminar[], series: Series[] } {
    return {
      seminars: this.getSeminars(),
      series: this.getSeries()
    };
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SEMINARS);
    localStorage.removeItem(STORAGE_KEYS.SERIES);
  }

  static resetAndReinitialize(): void {
    console.log('🔄 Reiniciando aplicación...');
    this.clearAllData();
    this.initializeWithMockData(true);
    console.log('✅ Aplicación reiniciada con datos frescos');
  }

  // ============== MÉTODO PARA DESARROLLO ==============
  
  static devReset(): void {
    if (typeof window !== 'undefined') {
      console.log('🛠️ DESARROLLO: Limpiando y reinicializando datos...');
      this.resetAndReinitialize();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  // ============== LIMPIAR AYUDAS DE ESTUDIO ==============
  
  static clearAllStudyAids(): void {
    const seminars = this.getSeminars();
    const series = this.getSeries();
    
    // Limpiar ayudas de todos los seminarios
    const cleanedSeminars = seminars.map(seminar => ({
      ...seminar,
      lessons: seminar.lessons.map(lesson => ({
        ...lesson,
        fragments: lesson.fragments.map(fragment => ({
          ...fragment,
          studyAids: ''
        }))
      }))
    }));
    
    // Limpiar ayudas de todas las series
    const cleanedSeries = series.map(serie => ({
      ...serie,
      lessons: serie.lessons.map(lesson => ({
        ...lesson,
        fragments: lesson.fragments.map(fragment => ({
          ...fragment,
          studyAids: ''
        }))
      }))
    }));
    
    this.saveSeminars(cleanedSeminars);
    this.saveSeries(cleanedSeries);
    
    console.log('Todas las ayudas de estudio han sido eliminadas');
  }

  static preserveLesson1StudyAids(lesson1Aids: { [fragmentId: string]: string }): void {
    const seminars = this.getSeminars();
    
    if (seminars.length > 0 && seminars[0].lessons.length > 0) {
      const updatedSeminars = [...seminars];
      const firstSeminar = { ...updatedSeminars[0] };
      const firstLesson = { ...firstSeminar.lessons[0] };
      
      // Aplicar las ayudas personalizadas a los fragmentos de la lección 1
      firstLesson.fragments = firstLesson.fragments.map(fragment => ({
        ...fragment,
        studyAids: lesson1Aids[fragment.id] || ''
      }));
      
      firstSeminar.lessons[0] = firstLesson;
      updatedSeminars[0] = firstSeminar;
      
      this.saveSeminars(updatedSeminars);
      console.log('Ayudas personalizadas de la lección 1 preservadas');
    }
  }

  // ============== DATOS MOCK INICIALES ==============
  
  static initializeWithMockData(force = true): void {
    // Siempre reinicializar por defecto, a menos que se especifique lo contrario
    const existingSeminars = this.getSeminars();
    const existingSeries = this.getSeries();
    
    if ((existingSeminars.length === 0 && existingSeries.length === 0) || force) {
      console.log('🚀 Inicializando datos de la aplicación...');
      
      // Definir los seminarios reales con sus lecciones específicas
      const realSeminars = [
        {
          title: "SEMINARIO DE SANACIÓN INTERIOR Y LIBERACIÓN",
          description: "Un seminario completo sobre sanación interior y liberación espiritual",
          lessons: [
            "Introducción del seminario de Sanación interior y liberación",
            "El pecado",
            "El perdón",
            "Ataduras heredadas y adquiridas",
            "La Brujería",
            "Sentimientos de culpabilidad",
            "Clases de maldiciones",
            "Sanación física",
            "Introducción a la efusión del Espíritu Santo"
          ]
        },
        {
          title: "SEMINARIO DE ARMADURA DE ORACIÓN",
          description: "Aprende sobre las armas espirituales y el poder de la oración",
          lessons: [
            "El Espíritu Santo en la oración",
            "La oración de alabanza",
            "Las armas espirituales: La autoridad",
            "Las armas espirituales: La sangre",
            "Las armas espirituales: La palabra",
            "La oración en la vida de Jesús",
            "Tu puedes sanar",
            "La oración de Intercesión",
            "Las promesas de Dios son para ti"
          ]
        },
        {
          title: "COMO VIVIR BAJO LA PODEROSA BENDICIÓN DE DIOS",
          description: "Descubre como vivir en la bendición y prosperidad de Dios",
          lessons: [
            "Maneras de vivir",
            "La bendición del trabajo",
            "¿Qué es la bendición?",
            "La provisión",
            "La Promoción",
            "La Protección",
            "El Poder de la Bendición",
            "Dar Principio de Bendición",
            "Dar: Principio de Prosperidad"
          ]
        },
        {
          title: "ESPÍRITU SANTO QUIERO MÁS DE TI",
          description: "Un estudio profundo sobre la persona y obra del Espíritu Santo",
          lessons: [
            "El gran desconocido",
            "El Espíritu Santo es Dios",
            "El Espíritu Santo es una persona",
            "El Espíritu Santo fue enviado para defendernos",
            "El Espíritu Santo hace nuevas todas las cosas",
            "El pentecostés personal",
            "Los dones del Espíritu Santo",
            "Los frutos del Espíritu Santo",
            "Los carismas del Espíritu Santo",
            "Las obras del Espíritu Santo",
            "La intimidad con el Espíritu Santo",
            "El río del Espíritu Santo"
          ]
        },
        {
          title: "UNA FAMILIA EN BENDICIÓN",
          description: "Principios bíblicos para construir una familia sólida y bendecida",
          lessons: [
            "El diálogo",
            "Los celos",
            "Dejará el hombre a su padre y a su madre",
            "Honrar a Padre y madre",
            "El amor en la familia",
            "La sexualidad en la pareja",
            "El adulterio",
            "Previniendo el maltrato",
            "Las finanzas en el hogar",
            "La disciplina",
            "Fundamentos para la educación de los hijos 1",
            "Fundamentos para la educación de los hijos 2",
            "Fundamentos para la educación de los hijos 3",
            "Fundamentos para la educación de los hijos 4"
          ]
        },
        {
          title: "CRISTO NUESTRO SALVADOR",
          description: "La verdadera identidad en Cristo y el plan de redención",
          lessons: [
            "Introducción: La verdadera Identidad",
            "El sueño de Dios",
            "La gran tragedia",
            "La promesa del redentor",
            "El acto redentor",
            "La gran victoria",
            "Vida nueva en Cristo",
            "La esperanza gloriosa",
            "La transformación final"
          ]
        }
      ];

      const mockSeminars: Seminar[] = realSeminars.map((seminar, i) => ({
        id: `seminar-${i + 1}`,
        title: seminar.title,
        description: seminar.description,
        order: i + 1,
        type: 'seminar' as const,
        audioFiles: [], // Los archivos se agregarán posteriormente
        lessons: seminar.lessons.map((lessonTitle, j) => ({
          id: `lesson-sem-${i + 1}-${j + 1}`,
          title: lessonTitle,
          content: `<p>Contenido de la lección: ${lessonTitle}</p><p>Este contenido será desarrollado en detalle...</p>`,
          containerId: `seminar-${i + 1}`,
          containerType: 'seminar' as const,
          order: j + 1,
          fragments: [
            {
              id: `fragment-sem-${i + 1}-${j + 1}-1`,
              order: 1,
              readingMaterial: '<p>Material de lectura por desarrollar...</p>',
              slide: `<div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8">
                <div class="text-center space-y-6">
                  <h1 class="text-4xl font-bold">${lessonTitle}</h1>
                  <p class="text-xl opacity-90">${seminar.title}</p>
                  <div class="mt-8 p-4 bg-white bg-opacity-20 rounded-lg">
                    <p class="text-lg text-gray-600" style="color: rgb(75, 85, 99);">Lección ${j + 1} de ${seminar.lessons.length}</p>
                  </div>
                </div>
              </div>`,
              studyAids: '',
              isCollapsed: false
            }
          ]
        }))
      }));

      // No crear series por ahora, solo los seminarios reales
      const mockSeries: Series[] = [];

      this.saveSeminars(mockSeminars);
      this.saveSeries(mockSeries);
      
      console.log(`✅ ${mockSeminars.length} seminarios inicializados con ${mockSeminars.reduce((total, s) => total + s.lessons.length, 0)} lecciones totales`);
      console.log('📊 Primer seminario:', mockSeminars[0].title);
      console.log('🎯 Primera lección:', mockSeminars[0].lessons[0].title);
      console.log('📝 Template de diapositiva verificado:', mockSeminars[0].lessons[0].fragments[0].slide.includes('bg-gradient-to-br') ? '✅ Correcto' : '❌ Incorrecto');
    }
  }

  // ============== INICIALIZACIÓN AUTOMÁTICA ==============
  
  static autoInitialize(): void {
    if (typeof window !== 'undefined') {
      console.log('🔄 Auto-inicializando datos de la aplicación...');
      
      // Limpiar localStorage primero
      this.clearAllData();
      console.log('🗑️ localStorage limpiado');
      
      // Forzar inicialización
      this.initializeWithMockData(true);
      console.log('✅ Datos mock inicializados correctamente');
    }
  }
}
