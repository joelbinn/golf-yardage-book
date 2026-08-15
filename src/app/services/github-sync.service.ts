import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, debounceTime } from 'rxjs';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';
import { GithubConfig } from '../models/settings.model';
import { Course } from '../models/course.model';
import { Round } from '../models/round.model';

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

    // Reaktiv bakgrundssynkning 3 sekunder efter senaste dataförändring
    if (this.storage && this.storage.dataChanged$) {
      this.storage.dataChanged$
        .pipe(debounceTime(3000))
        .subscribe(() => {
          this.backgroundSync();
        });
    }
  }

  readonly isSyncing = signal<boolean>(false);
  readonly lastSyncError = signal<string | null>(null);
  readonly lastSyncSuccess = signal<string | null>(null);

  /**
   * Tyst bakgrundssynkning som inte avbryter eller visar felrutor i UI.
   */
  async backgroundSync(): Promise<void> {
    const cfg = this.settings.githubConfig();
    if (!cfg.owner || !cfg.repo || !cfg.token) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    if (this.isSyncing()) return;

    try {
      await this.syncAll();
    } catch (err) {
      console.warn('Automatisk bakgrundssynkning misslyckades tyst:', err);
    }
  }

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

  /**
   * Helper function for base64 decoding UTF-8 strings.
   */
  private fromBase64Utf8(base64Str: string): string {
    const cleanStr = base64Str.replace(/\s/g, '');
    if (typeof TextDecoder !== 'undefined') {
      const binaryStr = atob(cleanStr);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }
    return decodeURIComponent(escape(atob(cleanStr)));
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
   * Fetches raw text content of a file on GitHub if it exists.
   */
  async getFileContent(path: string, cfg: GithubConfig): Promise<string | null> {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch || 'main'}`;
    const headers = this.getAuthHeaders(cfg.token);

    try {
      const res: any = await firstValueFrom(this.http.get(url, { headers }));
      if (res && res.content) {
        return this.fromBase64Utf8(res.content);
      }
      return null;
    } catch {
      return null;
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
   * Fetches remote manifest and merges new/updated courses and rounds from GitHub to local storage.
   */
  async fetchAndMergeRemote(cfg: GithubConfig): Promise<{ fetchedCourses: number; fetchedRounds: number }> {
    const manifestStr = await this.getFileContent('manifest.json', cfg);
    if (!manifestStr) {
      return { fetchedCourses: 0, fetchedRounds: 0 };
    }

    let manifest: any;
    try {
      manifest = JSON.parse(manifestStr);
    } catch {
      return { fetchedCourses: 0, fetchedRounds: 0 };
    }

    const remoteCourses: Array<{ id: string; name: string; updatedAt?: string }> = Array.isArray(manifest.courses) ? manifest.courses : [];
    const remoteRounds: Array<{ id: string; courseName: string; date?: string; updatedAt?: string }> = Array.isArray(manifest.rounds) ? manifest.rounds : [];

    let fetchedCourses = 0;
    let fetchedRounds = 0;

    const localCoursesMap = new Map(this.storage.courses().map((c) => [c.id, c]));
    const localRoundsMap = new Map(this.storage.rounds().map((r) => [r.id, r]));

    // 1. Fetch remote courses if missing or remote is newer
    for (const rCourse of remoteCourses) {
      const local = localCoursesMap.get(rCourse.id);
      const isRemoteNewer = !local || (rCourse.updatedAt && local.updatedAt && new Date(rCourse.updatedAt) > new Date(local.updatedAt));

      if (isRemoteNewer) {
        const courseContent = await this.getFileContent(`courses/${rCourse.id}.json`, cfg);
        if (courseContent) {
          try {
            const courseData: Course = JSON.parse(courseContent);
            if (courseData && courseData.id && courseData.name) {
              await this.storage.saveCourse(courseData);
              fetchedCourses++;
            }
          } catch (e) {
            console.error(`Kunde inte tolka kursdata för ${rCourse.id}`, e);
          }
        }
      }
    }

    // 2. Fetch remote rounds if missing or remote is newer
    for (const rRound of remoteRounds) {
      const local = localRoundsMap.get(rRound.id);
      const isRemoteNewer = !local || (rRound.updatedAt && local.updatedAt && new Date(rRound.updatedAt) > new Date(local.updatedAt));

      if (isRemoteNewer) {
        const roundContent = await this.getFileContent(`rounds/${rRound.id}.json`, cfg);
        if (roundContent) {
          try {
            const roundData: Round = JSON.parse(roundContent);
            if (roundData && roundData.id && roundData.courseId) {
              await this.storage.saveRound(roundData);
              fetchedRounds++;
            }
          } catch (e) {
            console.error(`Kunde inte tolka runddata för ${rRound.id}`, e);
          }
        }
      }
    }

    if (fetchedCourses > 0 || fetchedRounds > 0) {
      await this.storage.initStorage();
    }

    return { fetchedCourses, fetchedRounds };
  }

  /**
   * Performs full synchronization:
   * 1. Fetch & Merge remote changes from GitHub.
   * 2. Push local changes to GitHub.
   * 3. Update manifest.json & compact every 5th commit.
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
      // Step A: Fetch & Merge remote changes from GitHub first
      const { fetchedCourses, fetchedRounds } = await this.fetchAndMergeRemote(cfg);

      const courses = this.storage.courses();
      const rounds = this.storage.rounds();

      // Step B: Push courses to /courses/{id}.json
      for (const course of courses) {
        await this.putFile(
          `courses/${course.id}.json`,
          JSON.stringify(course, null, 2),
          `sync: Uppdatera bana ${course.name}`,
          cfg
        );
      }

      // Step C: Push rounds to /rounds/{id}.json
      for (const round of rounds) {
        await this.putFile(
          `rounds/${round.id}.json`,
          JSON.stringify(round, null, 2),
          `sync: Uppdatera runda ${round.courseName} (${round.date.slice(0, 10)})`,
          cfg
        );
      }

      // Step D: Update manifest.json
      const currentCommitCount = this.settings.incrementSyncCommitCount();
      const shouldCompact = currentCommitCount >= 5;

      const manifest = {
        lastSyncedAt: new Date().toISOString(),
        syncCount: currentCommitCount,
        compactedAt: shouldCompact ? new Date().toISOString() : undefined,
        courses: courses.map((c) => ({ id: c.id, name: c.name, updatedAt: c.updatedAt })),
        rounds: rounds.map((r) => ({ id: r.id, courseName: r.courseName, date: r.date, updatedAt: r.updatedAt, status: r.status }))
      };

      await this.putFile(
        'manifest.json',
        JSON.stringify(manifest, null, 2),
        `sync: Uppdatera manifest.json (Synk #${currentCommitCount})`,
        cfg
      );

      // Step E: Perform compaction if syncCount >= 5
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
        ? `Tvåvägssynk och kompaktering slutförd! (Hämtade ${fetchedCourses} banor, ${fetchedRounds} rundor)`
        : `Tvåvägssynk slutförd! (Hämtade ${fetchedCourses} banor, ${fetchedRounds} rundor. Synk ${currentCommitCount}/5 till kompaktering)`;

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
