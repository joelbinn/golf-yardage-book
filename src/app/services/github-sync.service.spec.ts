import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { GithubSyncService } from './github-sync.service';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';

describe('GithubSyncService', () => {
  let service: GithubSyncService;
  let settingsService: SettingsService;
  let storageService: StorageService;
  let mockHttp: any;
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });

    settingsService = new SettingsService();
    storageService = new StorageService();

    settingsService.saveGithubConfig({
      owner: 'testowner',
      repo: 'testrepo',
      token: 'ghp_testtoken',
      branch: 'main'
    });

    mockHttp = {
      get: (url: string) => of({ name: 'testrepo' }),
      put: (url: string, body: any) => of({ content: { sha: 'sha-12345' } })
    };

    service = new GithubSyncService(mockHttp, settingsService, storageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test connection successfully', async () => {
    let requestedUrl = '';
    mockHttp.get = (url: string) => {
      requestedUrl = url;
      return of({ name: 'testrepo' });
    };

    const result = await service.testConnection();
    expect(result).toBe(true);
    expect(requestedUrl).toBe('https://api.github.com/repos/testowner/testrepo');
  });

  it('should throw Swedish error on 401 Unauthorized during testConnection', async () => {
    mockHttp.get = () => throwError(() => ({ status: 401, statusText: 'Unauthorized' }));

    await expect(service.testConnection()).rejects.toThrow('Ogiltig Personal Access Token (401 Unauthorized).');
  });

  it('should putFile with base64 encoded content', async () => {
    let putUrl = '';
    let putBody: any = null;

    mockHttp.get = () => throwError(() => ({ status: 404 }));
    mockHttp.put = (url: string, body: any) => {
      putUrl = url;
      putBody = body;
      return of({ content: { sha: 'sha-999' } });
    };

    const result = await service.putFile(
      'courses/course-1.json',
      '{"name":"Test Course"}',
      'Commit test',
      settingsService.githubConfig()
    );

    expect(result.sha).toBe('sha-999');
    expect(putUrl).toBe('https://api.github.com/repos/testowner/testrepo/contents/courses/course-1.json');
    expect(putBody.message).toBe('Commit test');
    expect(putBody.content).toBeDefined();
  });

  it('should syncAll successfully and trigger compaction when commit count reaches 5', async () => {
    mockHttp.get = () => throwError(() => ({ status: 404 }));
    mockHttp.put = () => of({ content: { sha: 'sha-abc' } });

    // Set commit count to 4 so incrementing reaches 5
    settingsService.setSyncCommitCount(4);

    const result = await service.syncAll();
    expect(result.compacted).toBe(true);
    expect(settingsService.syncCommitCount()).toBe(0);
  });
});
