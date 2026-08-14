import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';
import { GithubConfig } from '../models/settings.model';

export interface SyncResult {
  syncedCourses: number;
  syncedRounds: number;
  compacted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GithubSyncService {
  private http: HttpClient;
  private settings: SettingsService;
  private storage: StorageService;

  constructor(
    http?: HttpClient,
    settings?: SettingsService,
    storage?: StorageService
  ) {
    this.http = http ?? inject(HttpClient);
    this.settings = settings ?? inject(SettingsService);
    this.storage = storage ?? inject(StorageService);
  }

  readonly isSyncing = signal<boolean>(false);
  readonly lastSyncError = signal<string | null>(null);
  readonly lastSyncSuccess = signal<string | null>(null);

  /**
   * Helper function for base64 encoding UTF-8 strings.
   */
  private toBase64Utf8(str: string): string {
    if (typeof TextEncoder !== 'undefined') {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return btoa(unescape(encodeURIComponent(str)));
  }

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    });
  }

  /**
   * Tests connection to GitHub API with the provided or current configuration.
   */
  async testConnection(config?: GithubConfig): Promise<boolean> {
    const cfg = config || this.settings.githubConfig();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      throw new Error('GitHub-konfiguration saknas (ägare, repo eller token).');
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Enheten är offline. Kan inte nå GitHub.');
    }

    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;
    const headers = this.getAuthHeaders(cfg.token);

    try {
      await firstValueFrom(this.http.get(url, { headers }));
      return true;
    } catch (err: any) {
      if (err.status === 401) {
        throw new Error('Ogiltig Personal Access Token (401 Unauthorized).');
      }
      if (err.status === 404) {
        throw new Error(`Hittade inte repository '${cfg.owner}/${cfg.repo}' (404 Not Found).`);
      }
      throw new Error(err.message || 'Kunde inte ansluta till GitHub REST API.');
    }
  }

  /**
   * Fetches SHA of a file on GitHub if it exists.
   */
  private async getFileSha(path: string, cfg: GithubConfig): Promise<string | undefined> {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch || 'main'}`;
    const headers = this.getAuthHeaders(cfg.token);

    try {
      const res: any = await firstValueFrom(this.http.get(url, { headers }));
      return res?.sha;
    } catch {
      return undefined;
    }
  }

  /**
   * Creates or updates a file on GitHub via Contents API.
   */
  async putFile(path: string, contentStr: string, commitMessage: string, cfg: GithubConfig): Promise<{ sha: string }> {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
    const headers = this.getAuthHeaders(cfg.token);

    const existingSha = await this.getFileSha(path, cfg);
    const body: any = {
      message: commitMessage,
      content: this.toBase64Utf8(contentStr),
      branch: cfg.branch || 'main'
    };

    if (existingSha) {
      body.sha = existingSha;
    }

    try {
      const res: any = await firstValueFrom(this.http.put(url, body, { headers }));
      return { sha: res.content?.sha || '' };
    } catch (err: any) {
      throw new Error(`Kunde inte spara '${path}' på GitHub: ${err.message || err.statusText}`);
    }
  }

  /**
   * Performs full synchronization of courses, rounds, and manifest.
   * Compacts every 5th commit.
   */
  async syncAll(): Promise<SyncResult> {
    const cfg = this.settings.githubConfig();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      const msg = 'GitHub-konfiguration saknas (ägare, repo eller token).';
      this.lastSyncError.set(msg);
      throw new Error(msg);
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const msg = 'Enheten är offline. Kan inte synkronisera mot GitHub.';
      this.lastSyncError.set(msg);
      throw new Error(msg);
    }

    this.isSyncing.set(true);
    this.lastSyncError.set(null);
    this.lastSyncSuccess.set(null);

    try {
      const courses = this.storage.courses();
      const rounds = this.storage.rounds();

      // 1. Sync courses to /courses/{id}.json
      for (const course of courses) {
        await this.putFile(
          `courses/${course.id}.json`,
          JSON.stringify(course, null, 2),
          `sync: Uppdatera bana ${course.name}`,
          cfg
        );
      }

      // 2. Sync rounds to /rounds/{id}.json
      for (const round of rounds) {
        await this.putFile(
          `rounds/${round.id}.json`,
          JSON.stringify(round, null, 2),
          `sync: Uppdatera runda ${round.courseName} (${round.date.slice(0, 10)})`,
          cfg
        );
      }

      // 3. Update manifest.json
      const currentCommitCount = this.settings.incrementSyncCommitCount();
      const shouldCompact = currentCommitCount >= 5;

      const manifest = {
        lastSyncedAt: new Date().toISOString(),
        syncCount: currentCommitCount,
        compactedAt: shouldCompact ? new Date().toISOString() : undefined,
        courses: courses.map((c) => ({ id: c.id, name: c.name, updatedAt: c.updatedAt })),
        rounds: rounds.map((r) => ({ id: r.id, courseName: r.courseName, date: r.date, status: r.status }))
      };

      await this.putFile(
        'manifest.json',
        JSON.stringify(manifest, null, 2),
        `sync: Uppdatera manifest.json (Synk #${currentCommitCount})`,
        cfg
      );

      // 4. Perform compaction if syncCount >= 5
      let compacted = false;
      if (shouldCompact) {
        const fullBackup = await this.storage.exportBackupData();
        await this.putFile(
          'bundle-compacted.json',
          fullBackup,
          `compact: Automatisk kompaktering efter ${currentCommitCount} synkningar`,
          cfg
        );
        this.settings.resetSyncCommitCount();
        compacted = true;
      }

      const successMsg = compacted
        ? `Synkronisering och automatisk kompaktering slutförd! (${courses.length} banor, ${rounds.length} rundor)`
        : `Synkronisering slutförd! (${courses.length} banor, ${rounds.length} rundor. Synk ${currentCommitCount}/5 till kompaktering)`;

      this.lastSyncSuccess.set(successMsg);
      this.isSyncing.set(false);

      return {
        syncedCourses: courses.length,
        syncedRounds: rounds.length,
        compacted
      };
    } catch (err: any) {
      this.isSyncing.set(false);
      const errorMsg = err.message || 'Ett okänt fel uppstod vid synkroniseringen.';
      this.lastSyncError.set(errorMsg);
      throw new Error(errorMsg);
    }
  }
}
