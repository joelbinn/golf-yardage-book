import { Injectable, signal, computed } from '@angular/core';
import { Course } from '../models/course.model';
import { Round } from '../models/round.model';

const DB_NAME = 'GolfYardageBookDB';
const DB_VERSION = 1;
const COURSES_STORE = 'courses';
const ROUNDS_STORE = 'rounds';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  // Reactive signals for component consumption
  readonly courses = signal<Course[]>([]);
  readonly rounds = signal<Round[]>([]);
  readonly isLoaded = signal<boolean>(false);

  readonly coursesCount = computed(() => this.courses().length);
  readonly roundsCount = computed(() => this.rounds().length);

  constructor() {
    this.initStorage();
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(COURSES_STORE)) {
          db.createObjectStore(COURSES_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(ROUNDS_STORE)) {
          db.createObjectStore(ROUNDS_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async initStorage(): Promise<void> {
    try {
      await this.loadCourses();
      await this.loadRounds();
      this.isLoaded.set(true);
    } catch (err) {
      console.warn('IndexedDB initialization failed, falling back to LocalStorage', err);
      this.loadFromLocalStorage();
      this.isLoaded.set(true);
    }
  }

  // --- Course Operations ---

  async loadCourses(): Promise<Course[]> {
    try {
      const db = await this.getDB();
      const items = await this.getAllFromStore<Course>(db, COURSES_STORE);
      this.courses.set(items);
      this.saveToLocalStorage('courses', items);
      return items;
    } catch {
      const local = this.getFromLocalStorage<Course>('courses');
      this.courses.set(local);
      return local;
    }
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const list = this.courses();
    const found = list.find((c) => c.id === id);
    if (found) return found;

    try {
      const db = await this.getDB();
      return await this.getOneFromStore<Course>(db, COURSES_STORE, id);
    } catch {
      return undefined;
    }
  }

  async saveCourse(course: Course): Promise<void> {
    const now = new Date().toISOString();
    const updatedCourse: Course = {
      ...course,
      updatedAt: now,
      createdAt: course.createdAt || now
    };

    try {
      const db = await this.getDB();
      await this.putToStore(db, COURSES_STORE, updatedCourse);
    } catch {
      // Fallback
    }

    const updatedList = this.courses().filter((c) => c.id !== updatedCourse.id);
    updatedList.push(updatedCourse);
    this.courses.set(updatedList);
    this.saveToLocalStorage('courses', updatedList);
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await this.deleteFromStore(db, COURSES_STORE, id);
    } catch {
      // Fallback
    }

    const updatedList = this.courses().filter((c) => c.id !== id);
    this.courses.set(updatedList);
    this.saveToLocalStorage('courses', updatedList);
  }

  // --- Round Operations ---

  async loadRounds(): Promise<Round[]> {
    try {
      const db = await this.getDB();
      const items = await this.getAllFromStore<Round>(db, ROUNDS_STORE);
      this.rounds.set(items);
      this.saveToLocalStorage('rounds', items);
      return items;
    } catch {
      const local = this.getFromLocalStorage<Round>('rounds');
      this.rounds.set(local);
      return local;
    }
  }

  async getRound(id: string): Promise<Round | undefined> {
    const list = this.rounds();
    const found = list.find((r) => r.id === id);
    if (found) return found;

    try {
      const db = await this.getDB();
      return await this.getOneFromStore<Round>(db, ROUNDS_STORE, id);
    } catch {
      return undefined;
    }
  }

  async saveRound(round: Round): Promise<void> {
    const now = new Date().toISOString();
    const updatedRound: Round = {
      ...round,
      updatedAt: now,
      createdAt: round.createdAt || now
    };

    try {
      const db = await this.getDB();
      await this.putToStore(db, ROUNDS_STORE, updatedRound);
    } catch {
      // Fallback
    }

    const updatedList = this.rounds().filter((r) => r.id !== updatedRound.id);
    updatedList.push(updatedRound);
    this.rounds.set(updatedList);
    this.saveToLocalStorage('rounds', updatedList);
  }

  async deleteRound(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await this.deleteFromStore(db, ROUNDS_STORE, id);
    } catch {
      // Fallback
    }

    const updatedList = this.rounds().filter((r) => r.id !== id);
    this.rounds.set(updatedList);
    this.saveToLocalStorage('rounds', updatedList);
  }

  // --- Helper IDB Methods ---

  private getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private getOneFromStore<T>(db: IDBDatabase, storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private putToStore<T>(db: IDBDatabase, storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private deleteFromStore(db: IDBDatabase, storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- LocalStorage Fallback Helpers ---

  private saveToLocalStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(`gyb_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  private getFromLocalStorage<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(`gyb_${key}`);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private loadFromLocalStorage(): void {
    const courses = this.getFromLocalStorage<Course>('courses');
    const rounds = this.getFromLocalStorage<Round>('rounds');
    this.courses.set(courses);
    this.rounds.set(rounds);
  }
}
