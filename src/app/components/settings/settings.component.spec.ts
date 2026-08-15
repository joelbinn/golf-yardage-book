import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../services/settings.service';
import { GeolocationService } from '../../services/geolocation.service';
import { StorageService } from '../../services/storage.service';
import { GithubSyncService } from '../../services/github-sync.service';

describe('SettingsComponent Version & Git SHA', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    const mockLocalStorage: Record<string, string> = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => mockLocalStorage[k] || null,
        setItem: (k: string, v: string) => {
          mockLocalStorage[k] = v;
        },
        removeItem: (k: string) => delete mockLocalStorage[k],
        clear: () => {}
      },
      writable: true,
      configurable: true
    });

    const settingsService = new SettingsService();
    const storageService = new StorageService();
    const geoService = new GeolocationService();
    const mockHttp: any = { get: () => {}, put: () => {} };
    const githubSyncService = new GithubSyncService(mockHttp, settingsService, storageService);

    component = new SettingsComponent(settingsService, geoService, storageService, githubSyncService);
  });

  it('should initialize with null versionInfo and false isCopied', () => {
    expect(component.versionInfo()).toBeNull();
    expect(component.isCopied()).toBe(false);
  });

  it('should copy git sha to clipboard when versionInfo is set', async () => {
    component.versionInfo.set({
      hash: 'abc1234567890def',
      shortHash: 'abc1234',
      date: '2026-08-15'
    });

    let copiedText = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          copiedText = text;
        }
      },
      writable: true,
      configurable: true
    });

    await component.copyGitSha();

    expect(copiedText).toBe('abc1234567890def');
    expect(component.isCopied()).toBe(true);
  });
});
