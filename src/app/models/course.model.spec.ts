import { describe, it, expect } from 'vitest';
import { Hole, Tee, TargetLine } from './course.model';

describe('Course Model & TargetLine', () => {
  it('should support multiple Tees and a TargetLine bound to a Tee', () => {
    const teeGul: Tee = {
      id: 'tee-gul',
      name: 'Gul',
      color: '#eab308',
      position: { lat: 59.3293, lng: 18.0686 }
    };

    const teeVit: Tee = {
      id: 'tee-vit',
      name: 'Vit',
      color: '#f8fafc',
      position: { lat: 59.3295, lng: 18.0688 }
    };

    const targetLine: TargetLine = {
      teeId: 'tee-gul',
      waypoints: [
        { lat: 59.33, lng: 18.07 }
      ]
    };

    const hole: Hole = {
      number: 1,
      par: 4,
      handicapIndex: 1,
      green: {
        front: { lat: 59.331, lng: 18.072 },
        center: { lat: 59.3312, lng: 18.0722 },
        back: { lat: 59.3314, lng: 18.0724 }
      },
      objects: [],
      tees: [teeGul, teeVit],
      targetLine
    };

    expect(hole.tees).toHaveLength(2);
    expect(hole.targetLine?.teeId).toBe('tee-gul');
    expect(hole.targetLine?.waypoints).toHaveLength(1);
  });
});
