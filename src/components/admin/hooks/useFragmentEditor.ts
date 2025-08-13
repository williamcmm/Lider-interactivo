import { useState } from 'react';
import { Fragment } from '@/types';

export function useFragmentEditor(initialFragments: Fragment[]) {
  const [fragments, setFragments] = useState<Fragment[]>(initialFragments);
  const [editingFragmentIndex, setEditingFragmentIndex] = useState<number | null>(null);

  const updateFragment = (index: number, field: string, value: any) => {
    const updatedFragments = [...fragments];
    updatedFragments[index] = { ...updatedFragments[index], [field]: value };
    setFragments(updatedFragments);
  };

  const addSlide = (fragmentIndex: number) => {
    const fragment = fragments[fragmentIndex];
    const newSlide = {
      id: `slide_${Date.now()}`,
      order: fragment.slides.length + 1,
      title: `Nueva Diapositiva ${fragment.slides.length + 1}`,
      content: '<h2>Título</h2><p>Contenido de la diapositiva...</p>'
    };

    const updatedFragments = [...fragments];
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: [...fragment.slides, newSlide]
    };
    setFragments(updatedFragments);
  };

  const updateSlide = (fragmentIndex: number, slideIndex: number, field: string, value: string) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedSlides = [...fragment.slides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], [field]: value };
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: updatedSlides
    };
    setFragments(updatedFragments);
  };

  const removeSlide = (fragmentIndex: number, slideIndex: number) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedSlides = fragment.slides.filter((_, i) => i !== slideIndex);
    
    // Reordenar
    updatedSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      slides: updatedSlides
    };
    setFragments(updatedFragments);
  };

  const addVideo = (fragmentIndex: number) => {
    const fragment = fragments[fragmentIndex];
    const newVideo = {
      id: `video_${Date.now()}`,
      order: fragment.videos.length + 1,
      title: `Nuevo Video ${fragment.videos.length + 1}`,
      youtubeId: 'dQw4w9WgXcQ',
      description: ''
    };

    const updatedFragments = [...fragments];
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: [...fragment.videos, newVideo]
    };
    setFragments(updatedFragments);
  };

  const updateVideo = (fragmentIndex: number, videoIndex: number, field: string, value: string) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedVideos = [...fragment.videos];
    updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], [field]: value };
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: updatedVideos
    };
    setFragments(updatedFragments);
  };

  const removeVideo = (fragmentIndex: number, videoIndex: number) => {
    const updatedFragments = [...fragments];
    const fragment = updatedFragments[fragmentIndex];
    const updatedVideos = fragment.videos.filter((_, i) => i !== videoIndex);
    
    // Reordenar
    updatedVideos.forEach((video, index) => {
      video.order = index + 1;
    });
    
    updatedFragments[fragmentIndex] = {
      ...fragment,
      videos: updatedVideos
    };
    setFragments(updatedFragments);
  };

  return {
    fragments,
    editingFragmentIndex,
    setFragments,
    setEditingFragmentIndex,
    updateFragment,
    addSlide,
    updateSlide,
    removeSlide,
    addVideo,
    updateVideo,
    removeVideo
  };
}
