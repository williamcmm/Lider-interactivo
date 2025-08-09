<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Study App v1.3 - Copilot Instructions

This is a Next.js application built with TypeScript, Tailwind CSS, Firebase, and Firestore for a study application focused on biblical seminars and lessons.

## Version 1.3 Status
- ✅ **Complete responsive layout** with resizable panels
- ✅ **Perfect viewport fitting** (no external scroll)
- ✅ **Full navigation system** with sidebar and lesson selection
- ✅ **4-panel layout**: Reading, Slides, Music, Notes with tabs
- ✅ **Fragment-based content system** with synchronized navigation
- ✅ **Administrative panel** for content creation and editing
- ✅ **LocalStorage persistence** for data management
- ✅ **Professional presentation controls** centered on slide panel
- ✅ **TypeScript types** defined for all entities
- ✅ **CompactAudioPlayer component** always visible next to lesson titles
- ✅ **Real Bluetooth functionality** for device connection in MusicPanel
- ✅ **Improved error handling** for Bluetooth connectivity
- ✅ **Chromecast/AirPlay projection** with Presentation API
- ✅ **WhatsApp/Telegram sharing** with clickeable links
- ✅ **Shared-slide page** showing only slide content
- ✅ **Optimized slide controls** with proper sizing

## Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components for the UI
  - `StudyApp.tsx` - Main application with resizable panels and fragment navigation
  - `AdminPanel.tsx` - Administrative interface for content creation and editing
  - `TopBar.tsx` - Header with action buttons
  - `IconBar.tsx` - Left sidebar with icons
  - `Sidebar.tsx` - Collapsible navigation panel
  - `ReadingPanel.tsx` - Fragment-based lesson content display
  - `SlidePanel.tsx` - Presentation viewer with main navigation controls
  - `MusicPanel.tsx` - Audio controls with real Bluetooth connectivity
  - `NotesPanel.tsx` - Tabbed notes interface with study aids
  - `CompactAudioPlayer.tsx` - Always visible audio controls next to lesson titles
- `src/lib/` - Utility functions and persistence system
  - `storage.ts` - LocalStorage management for seminars and series
- `src/types/` - TypeScript type definitions including Fragment interface

## Key Features
- Responsive design with resizable panels using react-resizable-panels
- Administrative panel for creating and editing seminars and series
- Fragment-based lesson structure with rich content editing
- Synchronized navigation between reading material, slides, and study aids
- Professional presentation controls centered on slide panel
- LocalStorage persistence system for data management
- Sidebar navigation with seminars and lessons
- Note-taking functionality prepared for Firebase storage
- Music player for study ambiance
- Slide viewer with fragment navigation
- Content sharing capabilities (UI ready)

## Technologies Used
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Firebase/Firestore for data storage (configured)
- React Icons for UI icons
- React Resizable Panels for drag-to-resize functionality

## Code Style
- Use TypeScript for all components
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Make components responsive and accessible
- Maintain consistent spacing and layout

## Layout Specifications
- **Viewport**: Fixed to 100vh/100vw with no external scroll
- **Top Bar**: 48px height with action buttons
- **Main Layout**: 3-column resizable grid (35%, 35%, 30% default)
- **Center Column**: Vertically split (70% slides, 30% music)
- **All Panels**: Independent scrolling areas

## Firebase Integration
- Use Firestore for storing lessons, notes, and user data
- Implement proper data validation
- Handle authentication when needed
- Follow Firebase best practices for security

## Current Mock Data
- 5 seminars with 10 lessons each
- Static lesson content with HTML support
- Predefined shared notes examples
- Ready for Firebase migration
