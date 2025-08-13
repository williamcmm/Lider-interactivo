// LocalStorage management system for seminars, series and notes
import type { 
  Seminar, 
  Series, 
  SharedNote, 
  Lesson, 
  Fragment 
} from '../types';

// Storage keys
const SEMINARS_KEY = 'study-app-seminars';
const SERIES_KEY = 'study-app-series';
const SHARED_NOTES_KEY = 'study-app-shared-notes';

export class LocalStorageManager {
  // Seminars management
  static getSeminars(): Seminar[] {
    try {
      const stored = localStorage.getItem(SEMINARS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading seminars:', error);
      return [];
    }
  }

  static setSeminars(seminars: Seminar[]): void {
    try {
      localStorage.setItem(SEMINARS_KEY, JSON.stringify(seminars));
    } catch (error) {
      console.error('Error saving seminars:', error);
    }
  }

  static saveSeminars(seminars: Seminar[]): void {
    this.setSeminars(seminars);
  }

  // Series management
  static getSeries(): Series[] {
    try {
      const stored = localStorage.getItem(SERIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading series:', error);
      return [];
    }
  }

  static setSeries(series: Series[]): void {
    try {
      localStorage.setItem(SERIES_KEY, JSON.stringify(series));
    } catch (error) {
      console.error('Error saving series:', error);
    }
  }

  static saveSeries(series: Series[]): void {
    this.setSeries(series);
  }

  // Shared notes management
  static getSharedNotes(): SharedNote[] {
    try {
      const stored = localStorage.getItem(SHARED_NOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading shared notes:', error);
      return [];
    }
  }

  static setSharedNotes(notes: SharedNote[]): void {
    try {
      localStorage.setItem(SHARED_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving shared notes:', error);
    }
  }

  // Utility methods
  static clearAllData(): void {
    try {
      localStorage.removeItem(SEMINARS_KEY);
      localStorage.removeItem(SERIES_KEY);
      localStorage.removeItem(SHARED_NOTES_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}