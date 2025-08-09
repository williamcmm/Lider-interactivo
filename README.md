# Líder Interactivo CMM v1.0

Una aplicación web moderna para el estudio bíblico con seminarios, series, lecciones, y funcionalidades colaborativas.

## 🎉 Versión 1.0 - Características Implementadas

### ✅ **Layout y UI Completamente Funcional**
- **Paneles Redimensionables**: Los usuarios pueden arrastrar y redimensionar todos los paneles
- **Diseño Responsivo**: Se ajusta perfectamente al viewport sin scroll externo
- **Interfaz Moderna**: Diseño limpio con Tailwind CSS y componentes React
- **Navegación Intuitiva**: Sidebar desplegable con seminarios, series y lecciones

### ✅ **Funcionalidades Core**
- **Sistema de Seminarios y Series**: Estructura dual para organizar contenido
- **Visor de Lecciones**: Panel de lectura con contenido scroll independiente
- **Diapositivas**: Panel central con navegación de contenido visual
- **Reproductor de Música**: Controles para música de estudio
- **Sistema de Notas**: 4 pestañas (Ayuda, Notas, Compartidas, Compartir)
- **Vista de Administrador**: Panel completo para gestionar seminarios, series y lecciones

### ✅ **Tecnologías Integradas**
- **Next.js 15** con App Router y TypeScript
- **Tailwind CSS** para estilos consistentes
- **Firebase/Firestore** configurado (listo para datos)
- **React Resizable Panels** para UX de arrastre
- **React Icons** para iconografía

## Características Principales

- **Navegación de Seminarios**: Acceso organizado a seminarios y lecciones
- **Paneles Redimensionables**: Interfaz flexible con paneles ajustables
- **Toma de Notas**: Sistema de notas personales con almacenamiento en Firestore
- **Reproductor de Música**: Música de fondo para el estudio
- **Visor de Diapositivas**: Presentación de contenido visual
- **Compartir Contenido**: Funcionalidad para compartir notas y reflexiones
- **Diseño Responsivo**: Optimizado para dispositivos móviles y escritorio

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **Firebase/Firestore** - Base de datos y autenticación
- **React Icons** - Íconos para la interfaz
- **React Split** - Paneles redimensionables

## Configuración del Proyecto

### Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.local` y añadir tus credenciales de Firebase
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

### Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construcción para Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
src/
├── app/                 # Páginas de Next.js App Router
├── components/          # Componentes React
│   ├── StudyApp.tsx    # Componente principal
│   ├── TopBar.tsx      # Barra superior
│   ├── Sidebar.tsx     # Panel lateral
│   ├── ReadingPanel.tsx # Panel de lectura
│   ├── SlidePanel.tsx  # Visor de diapositivas
│   ├── MusicPanel.tsx  # Reproductor de música
│   └── NotesPanel.tsx  # Panel de notas
├── lib/                # Configuración y utilidades
│   └── firebase.ts     # Configuración de Firebase
└── types/              # Definiciones de TypeScript
    └── index.ts        # Tipos principales
```

## Funcionalidades

### Navegación de Contenido
- Sidebar con seminarios organizados
- Lecciones expandibles por seminario
- Selección de contenido dinámico

### Sistema de Notas
- Editor de notas personal
- Almacenamiento en Firestore
- Notas compartidas entre usuarios

### Interfaz de Usuario
- Paneles redimensionables
- Diseño responsivo
- Tema consistente con Tailwind CSS

## Contribuir

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.
