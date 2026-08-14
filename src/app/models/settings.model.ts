export type DistanceUnitType = 'm' | 'y';

export interface GithubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface UserSettings {
  unit: DistanceUnitType;
  github: GithubConfig;
  syncCommitCount: number;
}
