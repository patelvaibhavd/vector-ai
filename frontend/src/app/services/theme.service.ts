import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'vector-ai-theme';
  
  // Using signal for reactive theme state
  theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  private getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark'; // Default to dark theme
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem(this.STORAGE_KEY, newTheme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}

