import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsService } from './settings.service';
import { GithubConfig } from '../models/settings.model';

describe('SettingsService', () => {
  let service: SettingsService;
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

    service = new SettingsService();
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.unit()).toBe('m');
    expect(service.syncCommitCount()).toBe(0);
    expect(service.githubConfig()).toEqual({
      owner: '',
      repo: '',
      token: '',
      branch: 'main'
    });
  });

  it('should set unit and persist in localStorage', () => {
    service.setUnit('y');
    expect(service.unit()).toBe('y');

    const stored = JSON.parse(store['gyb_settings'] || '{}');
    expect(stored.unit).toBe('y');
  });

  it('should format distances correctly in meters and yards', () => {
    service.setUnit('m');
    expect(service.formatDistance(100)).toBe('100 m');
    expect(service.formatDistance(null)).toBe('-');

    service.setUnit('y');
    expect(service.formatDistance(100)).toBe('109 yd');
  });

  it('should save github config and persist', () => {
    const config: GithubConfig = {
      owner: 'testuser',
      repo: 'testrepo',
      token: 'ghp_secret',
      branch: 'main'
    };
    service.saveGithubConfig(config);
    expect(service.githubConfig()).toEqual(config);

    const stored = JSON.parse(store['gyb_settings'] || '{}');
    expect(stored.github.owner).toBe('testuser');
  });

  it('should handle sync commit count increments and resets', () => {
    expect(service.incrementSyncCommitCount()).toBe(1);
    expect(service.incrementSyncCommitCount()).toBe(2);
    expect(service.syncCommitCount()).toBe(2);

    service.resetSyncCommitCount();
    expect(service.syncCommitCount()).toBe(0);
  });
});
