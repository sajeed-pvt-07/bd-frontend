import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { AnalyticsService } from '../../services/analytics.service';

interface OpenWhenNote {
  id: string;
  prompt: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-open-when',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './open-when.component.html',
  styleUrl: './open-when.component.scss',
})
export class OpenWhenComponent {
  private readonly configService = inject(ConfigService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly openedNoteIds = new Set<string>();

  readonly viewModel$ = this.configService.getConfigs().pipe(
    map((configs) => this.createViewModel(configs.get('open-when-notes'))),
  );

  toggleNote(noteId: string): void {
    if (this.openedNoteIds.has(noteId)) {
      this.openedNoteIds.delete(noteId);
    } else {
      this.openedNoteIds.add(noteId);
      this.analyticsService.track('OPEN_WHEN_NOTE_OPEN');
    }
  }

  replayJourney(): void {
    this.analyticsService.track('JOURNEY_REPLAY');
  }

  isNoteOpen(noteId: string): boolean {
    return this.openedNoteIds.has(noteId);
  }

  private createViewModel(value: string | undefined): {
    notes: OpenWhenNote[];
    error: string | null;
  } {
    if (!value?.trim()) {
      return { notes: [], error: 'Open-when notes have not been configured yet.' };
    }

    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return { notes: [], error: 'Open-when notes must be a JSON list.' };
      }

      const notes = parsed.filter(
        (note): note is OpenWhenNote =>
          typeof note === 'object' &&
          note !== null &&
          'id' in note &&
          typeof note.id === 'string' &&
          !!note.id.trim() &&
          'prompt' in note &&
          typeof note.prompt === 'string' &&
          !!note.prompt.trim() &&
          'title' in note &&
          typeof note.title === 'string' &&
          !!note.title.trim() &&
          'message' in note &&
          typeof note.message === 'string' &&
          !!note.message.trim(),
      );

      if (notes.length !== parsed.length) {
        return {
          notes: [],
          error: 'Each open-when note needs an id, prompt, title, and message.',
        };
      }

      if (new Set(notes.map((note) => note.id)).size !== notes.length) {
        return { notes: [], error: 'Open-when note ids must be unique.' };
      }

      return { notes, error: null };
    } catch {
      return { notes: [], error: 'Open-when notes are not valid JSON.' };
    }
  }
}
