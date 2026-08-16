import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { GeolocationService } from '../../services/geolocation.service';
import { Course, CourseObject, Hole, ObjectType, Tee } from '../../models/course.model';
import { LatLng } from '../../models/geo.model';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './course-editor.component.html',
  styleUrl: './course-editor.component.css'
})
export class CourseEditorComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent?: MapComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly storage = inject(StorageService);
  readonly geo = inject(GeolocationService);

  readonly isEditMode = signal<boolean>(false);
  readonly courseId = signal<string>('');
  readonly name = signal<string>('');
  readonly clubName = signal<string>('');
  readonly holesCount = signal<9 | 18>(18);
  readonly currentHoleIndex = signal<number>(0);

  readonly holes = signal<Hole[]>([]);
  readonly placementMode = signal<'front' | 'center' | 'back' | 'hazard' | 'tee' | 'targetLine' | null>(null);

  // Hazard Modal State
  readonly showHazardModal = signal<boolean>(false);
  readonly hazardType = signal<ObjectType>('bunker');
  readonly hazardName = signal<string>('');
  readonly hazardPos = signal<LatLng | null>(null);

  // Tee Modal & Management State
  readonly showTeeModal = signal<boolean>(false);
  readonly teeName = signal<string>('Gul');
  readonly teeColor = signal<string>('#eab308');
  readonly teePos = signal<LatLng | null>(null);
  readonly selectedTeeIdForTargetLine = signal<string | null>(null);

  // Computed active hole and helpers
  readonly currentHole = computed(() => this.holes()[this.currentHoleIndex()]);
  readonly currentHoleNumber = computed(() => this.currentHoleIndex() + 1);

  readonly greenCenterLocation = computed<LatLng | null>(() => {
    const hole = this.currentHole();
    if (!hole) return null;
    if (hole.green?.center?.lat && hole.green.center.lng) {
      return hole.green.center;
    }
    if (hole.green?.front?.lat && hole.green.front.lng) {
      return hole.green.front;
    }
    if (hole.green?.back?.lat && hole.green.back.lng) {
      return hole.green.back;
    }
    return null;
  });

  readonly hasGreenPosition = computed<boolean>(() => this.greenCenterLocation() !== null);

  centerMapOnGreen(): void {
    const loc = this.greenCenterLocation();
    if (loc && this.mapComponent) {
      this.mapComponent.centerOnLocation(loc, 18);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.courseId.set(id);
      this.loadExistingCourse(id);
    } else {
      this.isEditMode.set(false);
      this.initNewCourse(18);
    }
  }

  private async loadExistingCourse(id: string): Promise<void> {
    const course = await this.storage.getCourse(id);
    if (course) {
      this.name.set(course.name);
      this.clubName.set(course.clubName || '');
      this.holesCount.set(course.holesCount);
      this.holes.set(course.holes);
    } else {
      this.initNewCourse(18);
    }
  }

  private initNewCourse(count: 9 | 18): void {
    this.holesCount.set(count);
    const newHoles: Hole[] = Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      par: 4,
      handicapIndex: i + 1,
      green: {
        front: { lat: 0, lng: 0 },
        center: { lat: 0, lng: 0 },
        back: { lat: 0, lng: 0 }
      },
      objects: []
    }));
    this.holes.set(newHoles);
  }

  setHolesCount(count: 9 | 18): void {
    if (count === this.holesCount()) return;
    this.holesCount.set(count);
    const current = this.holes();
    if (count === 9) {
      this.holes.set(current.slice(0, 9));
      if (this.currentHoleIndex() >= 9) {
        this.currentHoleIndex.set(8);
      }
    } else {
      const extra: Hole[] = Array.from({ length: 9 }, (_, i) => ({
        number: i + 10,
        par: 4,
        handicapIndex: i + 10,
        green: { front: { lat: 0, lng: 0 }, center: { lat: 0, lng: 0 }, back: { lat: 0, lng: 0 } },
        objects: []
      }));
      this.holes.set([...current, ...extra]);
    }
  }

  prevHole(): void {
    if (this.currentHoleIndex() > 0) {
      this.currentHoleIndex.update((i) => i - 1);
    }
  }

  nextHole(): void {
    if (this.currentHoleIndex() < this.holes().length - 1) {
      this.currentHoleIndex.update((i) => i + 1);
    }
  }

  adjustPar(delta: number): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };
    hole.par = Math.min(5, Math.max(3, hole.par + delta));
    list[idx] = hole;
    this.holes.set(list);
  }

  adjustHcp(delta: number): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };
    hole.handicapIndex = Math.min(18, Math.max(1, hole.handicapIndex + delta));
    list[idx] = hole;
    this.holes.set(list);
  }

  // --- Green Positioning ---

  togglePlacementMode(target: 'front' | 'center' | 'back'): void {
    if (this.placementMode() === target) {
      this.placementMode.set(null);
    } else {
      this.placementMode.set(target);
    }
  }

  setGreenPointFromGPS(target: 'front' | 'center' | 'back'): void {
    const pos = this.geo.currentPosition();
    if (pos) {
      this.setGreenCoordinates(target, { lat: pos.lat, lng: pos.lng });
    } else {
      alert('Hittade ingen GPS-position. Kontrollera att platsbehörighet är aktiverad.');
    }
  }

  setGreenCoordinates(target: 'front' | 'center' | 'back', point: LatLng): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };
    hole.green = {
      ...hole.green,
      [target]: { ...point }
    };
    list[idx] = hole;
    this.holes.set(list);
    this.placementMode.set(null);
  }

  // --- Map Click Handling ---

  onMapClick(point: LatLng): void {
    const mode = this.placementMode();
    if (mode === 'front' || mode === 'center' || mode === 'back') {
      this.setGreenCoordinates(mode, point);
    } else if (mode === 'hazard') {
      this.hazardPos.set(point);
      this.showHazardModal.set(true);
      this.placementMode.set(null);
    } else if (mode === 'tee') {
      this.teePos.set(point);
      this.showTeeModal.set(true);
      this.placementMode.set(null);
    } else if (mode === 'targetLine') {
      this.addWaypointToTargetLine(point);
    }
  }

  // --- Tee Management ---

  openAddTeeModal(fromGPS = false): void {
    if (fromGPS) {
      const pos = this.geo.currentPosition();
      if (pos) {
        this.teePos.set({ lat: pos.lat, lng: pos.lng });
      } else {
        this.teePos.set({ lat: 59.3293, lng: 18.0686 });
      }
      this.showTeeModal.set(true);
    } else {
      this.placementMode.set('tee');
    }
  }

  closeTeeModal(): void {
    this.showTeeModal.set(false);
    this.teeName.set('Gul');
    this.teeColor.set('#eab308');
    this.teePos.set(null);
  }

  saveTee(): void {
    const pos = this.teePos();
    if (!pos) return;

    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    const newTee: Tee = {
      id: 'tee-' + Date.now(),
      name: this.teeName().trim() || 'Tee',
      color: this.teeColor(),
      position: pos
    };

    if (!hole.tees) hole.tees = [];
    hole.tees = [...hole.tees, newTee];

    if (hole.targetLine && !hole.targetLine.teeId) {
      hole.targetLine.teeId = newTee.id;
    }

    list[idx] = hole;
    this.holes.set(list);
    this.closeTeeModal();
  }

  deleteTee(teeId: string): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };
    if (!hole.tees) return;

    hole.tees = hole.tees.filter((t) => t.id !== teeId);
    if (hole.targetLine?.teeId === teeId) {
      hole.targetLine.teeId = hole.tees[0]?.id;
    }

    list[idx] = hole;
    this.holes.set(list);
  }

  // --- Target Line Management ---

  toggleTargetLineMode(): void {
    if (this.placementMode() === 'targetLine') {
      this.placementMode.set(null);
    } else {
      this.placementMode.set('targetLine');
      const hole = this.currentHole();
      if (hole && hole.targetLine?.teeId) {
        this.selectedTeeIdForTargetLine.set(hole.targetLine.teeId);
      } else if (hole && hole.tees && hole.tees.length > 0) {
        this.selectedTeeIdForTargetLine.set(hole.tees[0].id);
      }
    }
  }

  setTargetLineTee(teeId: string): void {
    this.selectedTeeIdForTargetLine.set(teeId);
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    if (!hole.targetLine) {
      hole.targetLine = { teeId, waypoints: [] };
    } else {
      hole.targetLine = { ...hole.targetLine, teeId };
    }

    list[idx] = hole;
    this.holes.set(list);
  }

  addWaypointToTargetLine(point: LatLng): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    const selectedTeeId = this.selectedTeeIdForTargetLine() || hole.tees?.[0]?.id;

    if (!hole.targetLine) {
      hole.targetLine = { teeId: selectedTeeId, waypoints: [point] };
    } else {
      hole.targetLine = {
        teeId: selectedTeeId || hole.targetLine.teeId,
        waypoints: [...hole.targetLine.waypoints, point]
      };
    }

    list[idx] = hole;
    this.holes.set(list);
  }

  removeWaypointFromTargetLine(wpIndex: number): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    if (hole.targetLine) {
      const updatedWaypoints = hole.targetLine.waypoints.filter((_, i) => i !== wpIndex);
      hole.targetLine = { ...hole.targetLine, waypoints: updatedWaypoints };
      list[idx] = hole;
      this.holes.set(list);
    }
  }

  clearTargetLine(): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    hole.targetLine = undefined;
    list[idx] = hole;
    this.holes.set(list);
    this.placementMode.set(null);
  }

  // --- Hazard Management ---

  openAddHazardModal(fromGPS = true): void {
    if (fromGPS) {
      const pos = this.geo.currentPosition();
      if (pos) {
        this.hazardPos.set({ lat: pos.lat, lng: pos.lng });
      } else {
        this.hazardPos.set({ lat: 59.3293, lng: 18.0686 });
      }
      this.showHazardModal.set(true);
    } else {
      this.placementMode.set('hazard');
    }
  }

  closeHazardModal(): void {
    this.showHazardModal.set(false);
    this.hazardName.set('');
    this.hazardPos.set(null);
  }

  saveHazard(): void {
    const pos = this.hazardPos();
    if (!pos) return;

    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };

    const newObj: CourseObject = {
      id: 'obj-' + Date.now(),
      type: this.hazardType(),
      name: this.hazardName().trim() || this.getHazardTypeLabel(this.hazardType()),
      position: pos
    };

    hole.objects = [...hole.objects, newObj];
    list[idx] = hole;
    this.holes.set(list);
    this.closeHazardModal();
  }

  deleteHazard(hazardId: string): void {
    const idx = this.currentHoleIndex();
    const list = [...this.holes()];
    const hole = { ...list[idx] };
    hole.objects = hole.objects.filter((o) => o.id !== hazardId);
    list[idx] = hole;
    this.holes.set(list);
  }

  getHazardTypeLabel(type: ObjectType): string {
    switch (type) {
      case 'bunker': return 'Bunker';
      case 'water': return 'Vattenhinder';
      case 'tree': return 'Träd';
      case 'custom': return 'Eget hinder';
    }
  }

  getHazardTypeColor(type: ObjectType): string {
    switch (type) {
      case 'bunker': return '#e1cfa8';
      case 'water': return '#3c5f6b';
      case 'tree': return '#8fa073';
      case 'custom': return '#c67139';
    }
  }

  // --- Save & Cancel ---

  async saveCourse(): Promise<void> {
    const nameVal = this.name().trim();
    if (!nameVal) {
      alert('Vänligen ange ett namn på banan.');
      return;
    }

    const id = this.isEditMode()
      ? this.courseId()
      : nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'bana-' + Date.now();

    const courseToSave: Course = {
      id,
      name: nameVal,
      clubName: this.clubName().trim(),
      holesCount: this.holesCount(),
      holes: this.holes(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.storage.saveCourse(courseToSave);
    this.router.navigate(['/courses']);
  }

  onCancel(): void {
    this.router.navigate(['/courses']);
  }
}
