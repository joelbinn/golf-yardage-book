import { LatLng } from './geo.model';

export type FairwayHit = 'left' | 'center' | 'right' | 'na';
export type DistanceUnit = 'meters' | 'yards';

export interface Score {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  fairwayHit?: FairwayHit;
  gir: boolean;
  bunkerShots: number;
  chips: number;
}

export interface Shot {
  id: string;
  holeNumber: number;
  startPosition: LatLng;
  endPosition: LatLng;
  distanceMeters: number;
  club?: string;
  timestamp: string;
}

export interface RoundStats {
  totalScore: number;
  totalPar: number;
  scoreDiff: number;
  totalPutts: number;
  fairwaysHitCount: number;
  fairwaysTotal: number;
  fairwayPercentage: number;
  girCount: number;
  girPercentage: number;
  totalBunkerShots: number;
  totalChips: number;
}

export interface Round {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  unit: DistanceUnit;
  currentHole: number;
  scores: Score[];
  shots: Shot[];
  stats?: RoundStats;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}
