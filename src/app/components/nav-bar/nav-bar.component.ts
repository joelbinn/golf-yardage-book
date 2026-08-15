import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GithubSyncService } from '../../services/github-sync.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  readonly githubSyncService: GithubSyncService;

  constructor(githubSyncService?: GithubSyncService) {
    this.githubSyncService = githubSyncService ?? inject(GithubSyncService);
  }
}
