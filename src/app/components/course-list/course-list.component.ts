import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent {
  readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly courses = this.storage.courses;
  readonly coursesCount = this.storage.coursesCount;
  readonly activeRound = this.storage.activeRound;

  async onStartRound(course: Course): Promise<void> {
    const round = await this.storage.startRound(course);
    this.router.navigate(['/play', round.id]);
  }

  onResumeRound(roundId: string): void {
    this.router.navigate(['/play', roundId]);
  }

  onCreateCourse(): void {
    this.router.navigate(['/courses/new']);
  }

  onEditCourse(course: Course): void {
    this.router.navigate(['/courses/edit', course.id]);
  }

  onDeleteCourse(course: Course, event: Event): void {
    event.stopPropagation();
    if (confirm(`Är du säker på att du vill ta bort banan "${course.name}"?`)) {
      this.storage.deleteCourse(course.id);
    }
  }
}
