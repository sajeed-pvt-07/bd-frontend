import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly storageKey = 'theme';
  private readonly darkClass = 'dark-theme';
  private readonly darkSubject = new BehaviorSubject(false);

  readonly isDark$ = this.darkSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
  }

  toggleTheme() {
    this.setDarkMode(!this.darkSubject.value);
  }

  private setDarkMode(isDark: boolean) {
    this.document.documentElement.classList.toggle(this.darkClass, isDark);
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    this.darkSubject.next(isDark);
  }
}
