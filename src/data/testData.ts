export const testData = {
  seminars: [{
    id: 'test-seminar-1',
    title: 'Seminario de Prueba',
    description: 'Seminario para probar el sistema de notas',
    order: 1,
    lessons: [{
      id: 'test-lesson-1',
      title: 'Lección de Prueba',
      order: 1,
      content: 'Contenido de prueba para seleccionar texto.',
      fragments: [{
        id: 'test-fragment-1',
        order: 1,
        readingMaterial: `
          <p>Este es un <strong>texto de prueba</strong> para seleccionar y crear notas. Puedes seleccionar cualquier parte de este texto y debería aparecer un popup para agregar una nota.</p>
          <p>También puedes probar seleccionando este párrafo completo para ver cómo funciona el sistema de notas con selección de texto.</p>
          <p>Aquí tienes más contenido para experimentar con las funciones de notas. Selecciona diferentes partes y observa cómo aparece el popup inteligente.</p>
        `,
        slides: [
          {
            id: 'slide-1',
            title: 'Diapositiva 1',
            content: `
              <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 rounded-lg h-full flex items-center justify-center">
                <div class="text-center">
                  <h1 class="text-6xl font-bold mb-6">Diapositiva 1</h1>
                  <p class="text-2xl opacity-90">Contenido de ejemplo para la primera diapositiva</p>
                </div>
              </div>
            `,
            order: 1
          },
          {
            id: 'slide-2',
            title: 'Diapositiva 2',
            content: `
              <div class="bg-gradient-to-br from-green-600 to-green-800 text-white p-12 rounded-lg h-full flex items-center justify-center">
                <div class="text-center">
                  <h1 class="text-6xl font-bold mb-6">Diapositiva 2</h1>
                  <p class="text-2xl opacity-90">Segunda diapositiva con diferente diseño</p>
                </div>
              </div>
            `,
            order: 2
          },
          {
            id: 'slide-3',
            title: 'Diapositiva 3',
            content: `
              <div class="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-12 rounded-lg h-full flex items-center justify-center">
                <div class="text-center">
                  <h1 class="text-6xl font-bold mb-6">Diapositiva 3</h1>
                  <p class="text-2xl opacity-90">Tercera diapositiva con estilo diferente</p>
                  <ul class="text-xl mt-6 text-left max-w-md">
                    <li class="mb-2">• Punto importante 1</li>
                    <li class="mb-2">• Punto importante 2</li>
                    <li class="mb-2">• Punto importante 3</li>
                  </ul>
                </div>
              </div>
            `,
            order: 3
          }
        ],
        videos: [
          {
            id: 'video-1',
            title: 'Video Ejemplo 1',
            youtubeId: 'dQw4w9WgXcQ',
            description: 'Video de ejemplo para probar la funcionalidad',
            order: 1
          },
          {
            id: 'video-2',
            title: 'Video Ejemplo 2',
            youtubeId: 'jNQXAC9IVRw',
            description: 'Segundo video de ejemplo',
            order: 2
          },
          {
            id: 'video-3',
            title: 'Video Ejemplo 3',
            youtubeId: 'ZZ5LpwO-An4',
            description: 'Tercer video de ejemplo',
            order: 3
          }
        ],
        studyAids: '<p>Esta es una ayuda de estudio de ejemplo. Aquí puedes encontrar información adicional sobre el fragmento.</p>'
      }]
    }],
    audioFiles: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  series: []
};

// Función de inicialización (se ejecuta automáticamente)
function initializeTestData() {
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('studyApp_seminars');
    if (!existing) {
      localStorage.setItem('studyApp_seminars', JSON.stringify(testData.seminars));
      localStorage.setItem('studyApp_series', JSON.stringify(testData.series));
    }
  }
}
