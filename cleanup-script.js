/**
 * Script temporal para gestionar la limpieza de ayudas de estudio
 * Solo ejecutar una vez para limpiar datos mock
 */

// Para usar este script, agregarlo temporalmente al final de StudyApp.tsx
// y llamar cleanUpStudyAids() desde useEffect

export const cleanUpStudyAids = () => {
  // Función para ejecutar una sola vez
  const hasBeenCleaned = localStorage.getItem('studyAidsCleaned');
  
  if (hasBeenCleaned) {
    console.log('Ayudas ya fueron limpiadas previamente');
    return;
  }

  console.log('=== INICIANDO LIMPIEZA DE AYUDAS ===');
  
  // Obtener datos actuales
  const seminars = JSON.parse(localStorage.getItem('lider-app-seminars') || '[]');
  console.log('Seminarios encontrados:', seminars.length);
  
  if (seminars.length > 0) {
    console.log('Primera lección del primer seminario:');
    console.log('Título:', seminars[0].lessons[0]?.title);
    console.log('Fragmentos:', seminars[0].lessons[0]?.fragments.length);
    
    seminars[0].lessons[0]?.fragments.forEach((fragment, index) => {
      console.log(`Fragmento ${index + 1} - ID: ${fragment.id}`);
      console.log(`Ayudas actuales: "${fragment.studyAids}"`);
    });
  }
  
  // Limpiar todas las ayudas
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
  
  // Guardar datos limpios
  localStorage.setItem('lider-app-seminars', JSON.stringify(cleanedSeminars));
  
  // Limpiar series también
  const series = JSON.parse(localStorage.getItem('lider-app-series') || '[]');
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
  
  localStorage.setItem('lider-app-series', JSON.stringify(cleanedSeries));
  
  // Marcar como limpiado
  localStorage.setItem('studyAidsCleaned', 'true');
  
  console.log('=== LIMPIEZA COMPLETADA ===');
  console.log('Todas las ayudas han sido eliminadas');
  console.log('Ahora puedes agregar tu contenido personalizado en la lección 1');
  
  // Recargar página para ver cambios
  window.location.reload();
};

// Función para mostrar las ayudas actuales de la lección 1
export const showLesson1Aids = () => {
  const seminars = JSON.parse(localStorage.getItem('lider-app-seminars') || '[]');
  
  if (seminars.length > 0 && seminars[0].lessons.length > 0) {
    const lesson1 = seminars[0].lessons[0];
    console.log('=== AYUDAS DE LA LECCIÓN 1 ===');
    console.log('Lección:', lesson1.title);
    
    lesson1.fragments.forEach((fragment, index) => {
      console.log(`\nFragmento ${index + 1}:`);
      console.log(`ID: ${fragment.id}`);
      console.log(`Ayudas: "${fragment.studyAids}"`);
    });
  }
};

// Función para aplicar ayudas específicas a la lección 1
export const applyLesson1Aids = (fragmentAids) => {
  const seminars = JSON.parse(localStorage.getItem('lider-app-seminars') || '[]');
  
  if (seminars.length > 0 && seminars[0].lessons.length > 0) {
    const updatedSeminars = [...seminars];
    const lesson1 = { ...updatedSeminars[0].lessons[0] };
    
    lesson1.fragments = lesson1.fragments.map((fragment, index) => ({
      ...fragment,
      studyAids: fragmentAids[index] || ''
    }));
    
    updatedSeminars[0].lessons[0] = lesson1;
    localStorage.setItem('lider-app-seminars', JSON.stringify(updatedSeminars));
    
    console.log('Ayudas aplicadas a la lección 1');
    window.location.reload();
  }
};

// Para ejecutar desde la consola del navegador:
// showLesson1Aids() - Ver ayudas actuales
// cleanUpStudyAids() - Limpiar todas las ayudas
// applyLesson1Aids(['ayuda1', 'ayuda2']) - Aplicar ayudas específicas
