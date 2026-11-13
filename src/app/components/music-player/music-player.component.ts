import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Song } from '../../models/Song';
import { SongService } from '../../services/song.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [LucideAngularModule, NgClass, NgFor, NgIf],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss',
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  private readonly songService = inject(SongService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly audio = new Audio();
  private autoPlay = false;
  private waitingForInteraction = false;
  private readonly unlockPlayback = () => this.playAfterInteraction();

  songs: Song[] = [];
  currentIndex = 0;
  isPlaying = false;
  isLoading = true;
  hasError = false;
  currentTime = 0;
  duration = 0;
  volume = 0.5;
  isExpanded = false;

  ngOnInit() {
    this.audio.preload = 'auto';
    this.audio.muted = true;
    this.audio.volume = this.volume;
    this.registerAudioEvents();

    this.songService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs
          .filter((song) => song.type === 'bgm')
          .sort((a, b) => a.priority - b.priority);
        this.isLoading = false;

        if (this.currentSong) {
          this.autoPlay = true;
          this.loadCurrentSong();
        }
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  ngOnDestroy() {
    this.removeUnlockListeners();
    this.audio.pause();
    this.audio.src = '';
  }

  get currentSong() {
    return this.songs[this.currentIndex];
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  togglePlayback() {
    if (!this.currentSong) {
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      return;
    }

    this.playAudible();
  }

  playSong(index: number) {
    if (index === this.currentIndex) {
      this.togglePlayback();
      return;
    }

    this.currentIndex = index;
    this.loadCurrentSong();
    this.playAudible();
  }

  playPrevious() {
    if (!this.songs.length) {
      return;
    }

    this.currentIndex =
      (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
    this.playAudible();
  }

  playNext() {
    if (!this.songs.length) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
    this.playAudible();
  }

  seek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audio.currentTime = Number(input.value);
  }

  setVolume(event: Event) {
    const input = event.target as HTMLInputElement;
    this.volume = Number(input.value);
    this.audio.volume = this.volume;
  }

  formatTime(value: number) {
    if (!Number.isFinite(value)) {
      return '0:00';
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private loadCurrentSong() {
    this.hasError = false;
    this.currentTime = 0;
    this.duration = 0;
    this.audio.src = this.currentSong.r2Url;
    this.audio.load();

    // Fallback: try to play after a short delay if autoPlay is set
    if (this.autoPlay) {
      setTimeout(() => {
        if (this.autoPlay) {
          this.tryAutoplay();
        }
      }, 500);
    }
  }

  private registerAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      if (!this.audio.muted && this.currentSong) {
        this.analyticsService.track('SONG_PLAY', { song: this.currentSong.name });
      }
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.currentSong) {
        this.analyticsService.track('SONG_PAUSE', { song: this.currentSong.name });
      }
    });
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio.duration;
    });
    this.audio.addEventListener('canplay', () => {
      if (this.autoPlay) {
        this.tryAutoplay();
      }
    });
    this.audio.addEventListener('ended', () => {
      if (this.currentSong) {
        this.analyticsService.track('SONG_END', { song: this.currentSong.name });
      }
      this.playNext();
    });
    this.audio.addEventListener('error', () => {
      this.isPlaying = false;
      this.hasError = true;
    });
  }

  private tryAutoplay() {
    this.autoPlay = false;
    this.audio.muted = true;
    this.audio.play()
      .then(() => this.waitForInteractionToUnmute())
      .catch(() => this.waitForInteractionToPlay());
  }

  private playAudible() {
    this.removeUnlockListeners();
    this.audio.muted = false;
    this.audio.play().catch(() => {
      this.isPlaying = false;
      this.waitForInteractionToPlay();
    });
  }

  private waitForInteractionToUnmute() {
    this.waitForInteraction(() => {
      this.audio.muted = false;
    });
  }

  private waitForInteractionToPlay() {
    this.waitForInteraction(() => this.playAudible());
  }

  private waitForInteraction(action: () => void) {
    if (this.waitingForInteraction) {
      return;
    }

    this.waitingForInteraction = true;
    this.unlockAction = action;
    window.addEventListener('pointerdown', this.unlockPlayback, { once: true });
    window.addEventListener('keydown', this.unlockPlayback, { once: true });
  }

  private unlockAction: (() => void) | null = null;

  private playAfterInteraction() {
    const action = this.unlockAction;
    this.removeUnlockListeners();
    action?.();
  }

  private removeUnlockListeners() {
    this.waitingForInteraction = false;
    this.unlockAction = null;
    window.removeEventListener('pointerdown', this.unlockPlayback);
    window.removeEventListener('keydown', this.unlockPlayback);
  }
}
