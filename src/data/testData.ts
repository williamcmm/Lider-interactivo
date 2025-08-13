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
        slide: `
          <div class="text-center p-8">
            <h1 class="text-4xl font-bold mb-4">Fragmento de Prueba</h1>
            <p class="text-xl">Slide de prueba para el sistema</p>
          </div>
        `,
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
