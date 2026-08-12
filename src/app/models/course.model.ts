import { LatLng } from './geo.model';

export type ObjectType = 'bunker' | 'water' | 'tree' | 'custom';

export interface CourseObject {
  id: string;
  type: ObjectType;
  name: string;
  position: LatLng;
  description?: string;
}

export interface Green {
  front: LatLng;
  center: LatLng;
  back: LatLng;
}

export interface Hole {
  number: number;
  par: number;
  handicapIndex: number;
  green: Green;
  objects: CourseObject[];
}

export interface Course {
  id: string;
  name: string;
  clubName?: string;
  holesCount: 9 | 18;
  holes: Hole[];
  createdAt: string;
  updatedAt: string;
}
