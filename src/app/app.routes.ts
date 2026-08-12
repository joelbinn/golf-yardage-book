import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  {
    path: 'courses',
    loadComponent: () =>
      import('./components/course-list/course-list.component').then((m) => m.CourseListComponent)
  },
  {
    path: 'courses/new',
    loadComponent: () =>
      import('./components/course-editor/course-editor.component').then((m) => m.CourseEditorComponent)
  },
  {
    path: 'courses/edit/:id',
    loadComponent: () =>
      import('./components/course-editor/course-editor.component').then((m) => m.CourseEditorComponent)
  },
  { path: '**', redirectTo: 'courses' }
];
