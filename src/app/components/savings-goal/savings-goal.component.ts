import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-savings-goal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './savings-goal.component.html',
  styleUrls: ['./savings-goal.component.css']
})
export class SavingsGoalComponent implements OnInit, OnDestroy {
  goalAmount: number = 0; // User's target savings
  currentSavings: number = 0; // Computed from transactions
  private sub!: Subscription;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.sub = this.storageService.transactions$.subscribe((txns: Transaction[]) => {
      this.computeCurrentSavings(txns);
    });
  }

  computeCurrentSavings(transactions: Transaction[]) {
    this.currentSavings = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  getProgressPercentage(): number {
    return this.goalAmount > 0 ? Math.min(100, (this.currentSavings / this.goalAmount) * 100) : 0;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
