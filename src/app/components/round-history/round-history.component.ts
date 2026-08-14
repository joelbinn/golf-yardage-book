import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Round } from '../../models/round.model';

@Component({
  selector: 'app-round-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './round-history.component.html',
  styleUrl: './round-history.component.css'
})
export class RoundHistoryComponent {
  readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  // Selected round for scorecard detail modal
  readonly selectedRound = signal<Round | null>(null);

  openScorecard(round: Round): void {
    this.selectedRound.set(round);
  }

  closeScorecard(): void {
    this.selectedRound.set(null);
  }

  resumeRound(round: Round): void {
    this.router.navigate(['/play', round.id]);
  }

  async deleteRound(event: Event, roundId: string): Promise<void> {
    event.stopPropagation();
    if (confirm('Är du säker på att du vill radera denna runda?')) {
      await this.storage.deleteRound(roundId);
      if (this.selectedRound()?.id === roundId) {
        this.closeScorecard();
      }
    }
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  formatScoreDiff(diff: number | undefined): string {
    if (diff === undefined || diff === null) return 'E';
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  }

  getFrontNineStrokes(round: Round): number {
    return round.scores.slice(0, 9).reduce((sum, s) => sum + s.strokes, 0);
  }

  getFrontNinePar(round: Round): number {
    return round.scores.slice(0, 9).reduce((sum, s) => sum + s.par, 0);
  }

  getBackNineStrokes(round: Round): number {
    return round.scores.slice(9, 18).reduce((sum, s) => sum + s.strokes, 0);
  }

  getBackNinePar(round: Round): number {
    return round.scores.slice(9, 18).reduce((sum, s) => sum + s.par, 0);
  }

  getTotalStrokes(round: Round): number {
    return round.scores.reduce((sum, s) => sum + s.strokes, 0);
  }

  getTotalPar(round: Round): number {
    return round.scores.reduce((sum, s) => sum + s.par, 0);
  }

  getTotalPutts(round: Round): number {
    return round.scores.reduce((sum, s) => sum + s.putts, 0);
  }
}
