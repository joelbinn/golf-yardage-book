import { Injectable, signal } from '@angular/core';
import { DistanceUnitType, GithubConfig, UserSettings } from '../models/settings.model';

const SETTINGS_KEY = 'gyb_settings';

const DEFAULT_SETTINGS: UserSettings = {
  unit: 'm',
  github: {
    owner: '',
    repo: '',
    token: '',
    branch: 'main'
  },
  syncCommitCount: 0
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly unit = signal<DistanceUnitType>('m');
  readonly githubConfig = signal<GithubConfig>(DEFAULT_SETTINGS.github);
  readonly syncCommitCount = signal<number>(0);

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed: Partial<UserSettings> = JSON.parse(stored);
        if (parsed.unit === 'm' || parsed.unit === 'y') {
          this.unit.set(parsed.unit);
        }
        if (parsed.github) {
          this.githubConfig.set({
            owner: parsed.github.owner || '',
            repo: parsed.github.repo || '',
            token: parsed.github.token || '',
            branch: parsed.github.branch || 'main'
          });
        }
        if (typeof parsed.syncCommitCount === 'number') {
          this.syncCommitCount.set(parsed.syncCommitCount);
        }
      }
    } catch (err) {
      console.error('Kunde inte läsa in inställningar från localStorage:', err);
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const settings: UserSettings = {
        unit: this.unit(),
        github: this.githubConfig(),
        syncCommitCount: this.syncCommitCount()
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Kunde inte spara inställningar till localStorage:', err);
    }
  }

  setUnit(unit: DistanceUnitType): void {
    this.unit.set(unit);
    this.persist();
  }

  saveGithubConfig(config: GithubConfig): void {
    this.githubConfig.set({ ...config });
    this.persist();
  }

  setSyncCommitCount(count: number): void {
    this.syncCommitCount.set(count);
    this.persist();
  }

  incrementSyncCommitCount(): number {
    const next = this.syncCommitCount() + 1;
    this.syncCommitCount.set(next);
    this.persist();
    return next;
  }

  resetSyncCommitCount(): void {
    this.syncCommitCount.set(0);
    this.persist();
  }

  convertDistance(meters: number): number {
    if (this.unit() === 'y') {
      return Math.round(meters * 1.09361);
    }
    return Math.round(meters);
  }

  formatDistance(meters: number | null | undefined): string {
    if (meters === null || meters === undefined || isNaN(meters)) {
      return '-';
    }
    const val = this.convertDistance(meters);
    return `${val} ${this.getUnitLabel()}`;
  }

  getUnitLabel(): string {
    return this.unit() === 'y' ? 'yd' : 'm';
  }
}
