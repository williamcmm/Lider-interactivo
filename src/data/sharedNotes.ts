import { SharedNote } from '@/types';

export const sampleSharedNotes: SharedNote[] = [
  {
    id: 'shared_1',
    noteId: 'note_1',
    content: 'Esta es una reflexión profunda sobre la creación. El relato del Génesis nos enseña sobre el orden divino en el cosmos.',
    authorName: 'María González',
    selectedText: 'el primer libro, el Génesis, narra la creación del mundo',
    comment: 'Compartido durante el estudio grupal del domingo',
    lessonTitle: 'Los orígenes según el Génesis',
    seminarTitle: 'Fundamentos Bíblicos',
    fragmentOrder: 1,
    sharedAt: new Date('2024-01-15')
  },
  {
    id: 'shared_2',
    noteId: 'note_2',
    content: 'Los profetas no solo predecían el futuro, sino que llamaban al pueblo al arrepentimiento y la justicia.',
    authorName: 'Carlos Mendoza',
    selectedText: 'Profetas como Isaías, Jeremías y Daniel registraron visiones y mensajes divinos',
    lessonTitle: 'Los Profetas del Antiguo Testamento',
    seminarTitle: 'Historia Bíblica',
    fragmentOrder: 2,
    sharedAt: new Date('2024-01-20')
  },
  {
    id: 'shared_3',
    noteId: 'note_3',
    content: 'La resurrección de Cristo es el fundamento de nuestra esperanza. Sin ella, nuestra fe sería vana.',
    authorName: 'Ana Jiménez',
    selectedText: 'la vida, muerte y resurrección de Jesucristo',
    comment: 'Reflexión sobre 1 Corintios 15',
    lessonTitle: 'La Obra de Cristo',
    seminarTitle: 'Nuevo Testamento',
    fragmentOrder: 1,
    sharedAt: new Date('2024-01-25')
  },
  {
    id: 'shared_4',
    noteId: 'note_4',
    content: 'Las cartas de Pablo son un tesoro de enseñanza práctica para la vida cristiana contemporánea.',
    authorName: 'Pedro Ramírez',
    selectedText: 'Las Epístolas, escritas por apóstoles como Pablo, Pedro y Juan',
    lessonTitle: 'Las Epístolas Paulinas',
    seminarTitle: 'Doctrina Cristiana',
    fragmentOrder: 3,
    sharedAt: new Date('2024-02-01')
  },
  {
    id: 'shared_5',
    noteId: 'note_5',
    content: 'El Apocalipsis nos recuerda que al final, Dios tiene el control y la justicia prevalecerá.',
    authorName: 'Lucía Torres',
    selectedText: 'una visión profética del fin de los tiempos y la victoria final de Dios',
    comment: 'Esperanza en tiempos difíciles',
    lessonTitle: 'Escatología Bíblica',
    seminarTitle: 'Profecía Bíblica',
    fragmentOrder: 4,
    sharedAt: new Date('2024-02-05')
  }
];

// Función para inicializar notas compartidas en localStorage
export function initializeSharedNotes() {
  const existingNotes = localStorage.getItem('sharedNotes');
  if (!existingNotes) {
    localStorage.setItem('sharedNotes', JSON.stringify(sampleSharedNotes));
    console.log('Notas compartidas de ejemplo inicializadas');
  }
}
