// Datos de prueba centralizados para el sistema
import type { Seminar, Series, SharedNote } from '@/types';

// Función para inicializar todos los datos de prueba
export function initializeSeedData(): void {
  try {
    // Datos semilla para seminarios
    const SEMINARS_SEED_DATA: Seminar[] = [
      {
        id: 'seminar_1',
        title: 'Fundamentos de la Fe Cristiana',
        description: 'Un estudio completo sobre los pilares fundamentales de la fe cristiana',
        order: 1,
        lessons: [
          {
            id: 'lesson_1_1',
            title: 'La Autoridad de las Escrituras',
            content: 'Estudio sobre la autoridad e inspiración divina de la Biblia',
            containerId: 'seminar_1',
            containerType: 'seminar',
            order: 1,
            fragments: [
              {
                id: 'fragment_1_1_1',
                order: 1,
                readingMaterial: '<h2>La Autoridad de las Escrituras</h2><p>La Biblia afirma ser la Palabra de Dios inspirada y autoritativa. En 2 Timoteo 3:16 leemos: "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia".</p>',
                slides: [
                  {
                    id: 'slide_1_1_1_1',
                    order: 1,
                    title: 'La Inspiración Divina',
                    content: '<div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 rounded-lg h-full flex items-center justify-center"><div class="text-center"><h1 class="text-4xl font-bold mb-6">2 Timoteo 3:16</h1><p class="text-xl">"Toda la Escritura es inspirada por Dios"</p></div></div>'
                  }
                ],
                videos: [
                  {
                    id: 'video_1_1_1_1',
                    order: 1,
                    title: 'La Inspiración de las Escrituras',
                    youtubeId: 'dQw4w9WgXcQ',
                    description: 'Video explicativo sobre la inspiración divina de la Biblia'
                  }
                ],
                studyAids: 'Preguntas para reflexión: 1. ¿Qué significa que la Escritura sea "inspirada por Dios"?',
                narrationAudio: undefined
              }
            ],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          }
        ],
        audioFiles: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Datos semilla para series
    const SERIES_SEED_DATA: Series[] = [
      {
        id: 'series_1',
        title: 'Líderes del Antiguo Testamento',
        description: 'Una serie sobre los grandes líderes que Dios usó en el Antiguo Testamento',
        order: 1,
        lessons: [
          {
            id: 'lesson_s1_1',
            title: 'Abraham: El Padre de la Fe',
            content: 'El llamado de Abraham y su respuesta de fe',
            containerId: 'series_1',
            containerType: 'series',
            order: 1,
            fragments: [
              {
                id: 'fragment_s1_1_1',
                order: 1,
                readingMaterial: '<h2>El Llamado de Abraham</h2><p>Dios llamó a Abraham a salir de su tierra...</p>',
                slides: [
                  {
                    id: 'slide_s1_1_1_1',
                    order: 1,
                    title: 'El Padre de la Fe',
                    content: '<div class="bg-gradient-to-br from-green-600 to-green-800 text-white p-12 rounded-lg h-full flex items-center justify-center"><div class="text-center"><h1 class="text-4xl font-bold mb-6">Abraham</h1><p class="text-xl">El Padre de la Fe</p></div></div>'
                  }
                ],
                videos: [],
                studyAids: '¿Qué aspectos del llamado de Abraham resuenan en tu propia experiencia de fe?',
                narrationAudio: undefined
              }
            ],
            createdAt: new Date('2024-01-18'),
            updatedAt: new Date('2024-01-18')
          }
        ],
        audioFiles: [],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      }
    ];

    // Datos semilla para notas compartidas
    const SHARED_NOTES_SEED_DATA: SharedNote[] = [
      {
        id: 'shared_note_1',
        noteId: 'note_1',
        content: 'La fe no es simplemente creer en algo, sino confiar completamente en Dios incluso cuando no entendemos sus caminos.',
        authorName: 'Administrador',
        lessonTitle: 'La Autoridad de las Escrituras',
        seminarTitle: 'Fundamentos de la Fe Cristiana',
        fragmentOrder: 1,
        sharedAt: new Date('2024-01-15')
      }
    ];

    // Limpiar datos existentes
    localStorage.removeItem('study-app-seminars');
    localStorage.removeItem('study-app-series');  
    localStorage.removeItem('study-app-shared-notes');
    
    // Inicializar con datos semilla
    localStorage.setItem('study-app-seminars', JSON.stringify(SEMINARS_SEED_DATA));
    localStorage.setItem('study-app-series', JSON.stringify(SERIES_SEED_DATA));
    localStorage.setItem('study-app-shared-notes', JSON.stringify(SHARED_NOTES_SEED_DATA));
    
    console.log('Datos de prueba inicializados correctamente');
    
  } catch (error) {
    console.error('Error al inicializar datos de prueba:', error);
  }
}
