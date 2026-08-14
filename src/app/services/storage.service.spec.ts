import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';
import { Round } from '../models/round.model';

describe('StorageService - Round Stats & Complete Round', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
  });

  it('should calculate round stats correctly', () => {
    const mockRound: Round = {
      id: 'round-test-1',
      courseId: 'course-1',
      courseName: 'Test Golf Club',
      date: new Date().toISOString(),
      unit: 'meters',
      currentHole: 1,
      scores: [
        { holeNumber: 1, par: 4, strokes: 4, putts: 2, fairwayHit: 'center', gir: true, bunkerShots: 0, chips: 0 }, // Par (FIR, GIR)
        { holeNumber: 2, par: 5, strokes: 6, putts: 2, fairwayHit: 'left', gir: false, bunkerShots: 1, chips: 1 },  // +1 (Missed FIR, missed GIR)
        { holeNumber: 3, par: 3, strokes: 3, putts: 1, fairwayHit: 'na', gir: true, bunkerShots: 0, chips: 0 }      // Par (Par 3 N/A, GIR)
      ],
      shots: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const stats = service.calculateRoundStats(mockRound);

    expect(stats.totalScore).toBe(13);
    expect(stats.totalPar).toBe(12);
    expect(stats.scoreDiff).toBe(1);
    expect(stats.totalPutts).toBe(5);
    expect(stats.fairwaysHitCount).toBe(1);
    expect(stats.fairwaysTotal).toBe(2);
    expect(stats.fairwayPercentage).toBe(50);
    expect(stats.girCount).toBe(2);
    expect(stats.girPercentage).toBe(67);
    expect(stats.totalBunkerShots).toBe(1);
    expect(stats.totalChips).toBe(1);
  });

  it('should complete round and mark status as completed', async () => {
    const mockRound: Round = {
      id: 'round-test-complete',
      courseId: 'course-1',
      courseName: 'Test Golf Club',
      date: new Date().toISOString(),
      unit: 'meters',
      currentHole: 1,
      scores: [
        { holeNumber: 1, par: 4, strokes: 4, putts: 2, fairwayHit: 'center', gir: true, bunkerShots: 0, chips: 0 }
      ],
      shots: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await service.saveRound(mockRound);
    const completed = await service.completeRound('round-test-complete');

    expect(completed.status).toBe('completed');
    expect(completed.stats).toBeDefined();
    expect(completed.stats?.totalScore).toBe(4);
    expect(completed.stats?.scoreDiff).toBe(0);
  });

  it('should export backup data as JSON string', async () => {
    const jsonStr = await service.exportBackupData();
    expect(jsonStr).toBeTypeOf('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe(1);
    expect(parsed.exportDate).toBeDefined();
    expect(Array.isArray(parsed.courses)).toBe(true);
    expect(Array.isArray(parsed.rounds)).toBe(true);
  });

  it('should import backup data from JSON string', async () => {
    const backupObj = {
      version: 1,
      exportDate: new Date().toISOString(),
      courses: [
        {
          id: 'imported-course-1',
          name: 'Imported GC',
          clubName: 'Imported Golf Club',
          holesCount: 9,
          holes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      rounds: [
        {
          id: 'imported-round-1',
          courseId: 'imported-course-1',
          courseName: 'Imported GC',
          date: new Date().toISOString(),
          unit: 'meters',
          currentHole: 1,
          scores: [],
          shots: [],
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    const result = await service.importBackupData(JSON.stringify(backupObj));
    expect(result.coursesCount).toBe(1);
    expect(result.roundsCount).toBe(1);
  });

  it('should throw error when importing invalid JSON string', async () => {
    await expect(service.importBackupData('invalid json')).rejects.toThrow();
  });
});
