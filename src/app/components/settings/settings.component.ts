import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { GeolocationService } from '../../services/geolocation.service';
import { StorageService } from '../../services/storage.service';
import { GithubSyncService } from '../../services/github-sync.service';
import { DistanceUnitType, GithubConfig } from '../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  readonly settingsService: SettingsService;
  readonly geoService: GeolocationService;
  readonly storageService: StorageService;
  readonly githubSyncService: GithubSyncService;

  constructor(
    settingsService?: SettingsService,
    geoService?: GeolocationService,
    storageService?: StorageService,
    githubSyncService?: GithubSyncService
  ) {
    this.settingsService = settingsService ?? inject(SettingsService);
    this.geoService = geoService ?? inject(GeolocationService);
    this.storageService = storageService ?? inject(StorageService);
    this.githubSyncService = githubSyncService ?? inject(GithubSyncService);
  }

  // Form State for GitHub
  readonly owner = signal<string>('');
  readonly repo = signal<string>('');
  readonly token = signal<string>('');
  readonly branch = signal<string>('main');

  // Status & Feedback Signals
  readonly isTestingConnection = signal<boolean>(false);
  readonly connectionStatusMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly importStatusMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // GPS Signals & Computeds
  readonly gpsAccuracy = computed<number | null>(() => this.geoService.currentPosition()?.accuracy ?? null);

  readonly gpsQualityClass = computed<'gps-green' | 'gps-yellow' | 'gps-red'>(() => {
    const acc = this.gpsAccuracy();
    if (acc === null) return 'gps-red';
    if (acc <= 5) return 'gps-green';
    if (acc <= 15) return 'gps-yellow';
    return 'gps-red';
  });

  readonly gpsQualityLabel = computed<string>(() => {
    const acc = this.gpsAccuracy();
    if (acc === null) return 'Söker GPS / Ej aktiverad';
    if (acc <= 5) return 'Hög precision';
    if (acc <= 15) return 'Godtagbar precision';
    return 'Låg precision';
  });

  readonly gpsAccuracyText = computed<string>(() => {
    const acc = this.gpsAccuracy();
    if (acc === null) return 'Ingen GPS-mottagning';
    return `±${Math.round(acc * 10) / 10} m`;
  });

  // Version & Git SHA Signals
  readonly versionInfo = signal<{ hash: string; shortHash: string; date: string; time?: string; dateTime?: string } | null>(null);
  readonly isCopied = signal<boolean>(false);

  ngOnInit(): void {
    this.geoService.startTracking();

    const cfg = this.settingsService.githubConfig();
    this.owner.set(cfg.owner || '');
    this.repo.set(cfg.repo || '');
    this.token.set(cfg.token || '');
    this.branch.set(cfg.branch || 'main');

    this.loadVersionInfo();
  }

  private async loadVersionInfo(): Promise<void> {
    try {
      const res = await fetch('version.json');
      if (res.ok) {
        const data = await res.json();
        this.versionInfo.set(data);
      }
    } catch {
      // Fallback
    }
  }

  async copyGitSha(): Promise<void> {
    const info = this.versionInfo();
    if (!info || !info.hash) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(info.hash);
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      }
    } catch {
      // Fallback
    }
  }

  // --- Unit Toggle ---
  onUnitChange(unit: DistanceUnitType): void {
    this.settingsService.setUnit(unit);
  }

  // --- GitHub Config & Test ---
  saveGithubSettings(): void {
    const cfg: GithubConfig = {
      owner: this.owner().trim(),
      repo: this.repo().trim(),
      token: this.token().trim(),
      branch: this.branch().trim() || 'main'
    };
    this.settingsService.saveGithubConfig(cfg);
    this.connectionStatusMessage.set({ type: 'success', text: 'GitHub-inställningar sparades!' });
  }

  async testConnection(): Promise<void> {
    this.saveGithubSettings();
    this.isTestingConnection.set(true);
    this.connectionStatusMessage.set(null);

    try {
      await this.githubSyncService.testConnection();
      this.connectionStatusMessage.set({
        type: 'success',
        text: 'Anslutning mot GitHub lyckades!'
      });
    } catch (err: any) {
      this.connectionStatusMessage.set({
        type: 'error',
        text: err.message || 'Kunde inte ansluta till GitHub.'
      });
    } finally {
      this.isTestingConnection.set(false);
    }
  }

  async syncNow(): Promise<void> {
    this.saveGithubSettings();
    try {
      await this.githubSyncService.syncAll();
    } catch (err: any) {
      console.error('Synkfel:', err);
    }
  }

  // --- Manual Backup Export & Import ---
  async exportBackup(): Promise<void> {
    try {
      const jsonStr = await this.storageService.exportBackupData();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `golf-yardage-book-backup-${dateStr}.json`;

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Kunde inte skapa backup: ${err.message}`);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      if (confirm(`Vill du importera data från "${file.name}"? Befintliga banor och rundor med samma ID kommer att skrivas över.`)) {
        try {
          const res = await this.storageService.importBackupData(content);
          this.importStatusMessage.set({
            type: 'success',
            text: `Import slutförd! Importerade ${res.coursesCount} banor och ${res.roundsCount} rundor.`
          });
        } catch (err: any) {
          this.importStatusMessage.set({
            type: 'error',
            text: err.message || 'Ett fel uppstod vid importen.'
          });
        }
      }
    };

    reader.readAsText(file);
    input.value = '';
  }
}
