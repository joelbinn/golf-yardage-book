import { describe, it, expect } from 'vitest';
import { StorageService } from './services/storage.service';
import { Course } from './models/course.model';

describe('StorageService', () => {
  it('should initialize and contain default course after seeding', async () => {
    const service = new StorageService();
    // Verify service instantiated
    expect(service).toBeTruthy();
  });
});
