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
  {
    path: 'play',
    loadComponent: () =>
      import('./components/play-round/play-round.component').then((m) => m.PlayRoundComponent)
  },
  {
    path: 'play/:roundId',
    loadComponent: () =>
      import('./components/play-round/play-round.component').then((m) => m.PlayRoundComponent)
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/round-history/round-history.component').then((m) => m.RoundHistoryComponent)
  },
  { path: '**', redirectTo: 'courses' }
];
