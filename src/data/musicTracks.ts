export interface Track {
  id: number;
  name: string;
  duration: string;
  artist: string;
}

export const sampleTracks: Track[] = [
  { id: 1, name: "Himno de Alabanza", duration: "4:32", artist: "Coro Celestial" },
  { id: 2, name: "Paz en el Valle", duration: "3:45", artist: "Grupo Esperanza" },
  { id: 3, name: "Camino de Fe", duration: "5:12", artist: "Voces de Adoración" },
  { id: 4, name: "Gracia Infinita", duration: "4:18", artist: "Ministerio de Música" },
  { id: 5, name: "Bendición Matutina", duration: "3:55", artist: "Coro Unido" },
  { id: 6, name: "Refugio Eterno", duration: "4:40", artist: "Alabanza Total" },
  { id: 7, name: "Luz Divina", duration: "3:28", artist: "Grupo Melodía" },
  { id: 8, name: "Esperanza Viva", duration: "5:01", artist: "Voces Celestiales" },
  { id: 9, name: "Amor Incondicional", duration: "4:15", artist: "Ministerio Joven" },
  { id: 10, name: "Gloria Eterna", duration: "3:38", artist: "Coro de Fe" }
];
