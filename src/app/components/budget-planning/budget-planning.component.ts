import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-budget-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-planning.component.html',
  styleUrls: ['./budget-planning.component.css']
})
export class BudgetPlanningComponent implements OnInit, OnDestroy {
  monthlyBudget: number = 0; 
  totalExpenses: number = 0; 
  private sub!: Subscription;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.sub = this.storageService.transactions$.subscribe((txns: Transaction[]) => {
      this.computeExpenses(txns);
    });
  }

  computeExpenses(transactions: Transaction[]) {
    this.totalExpenses = transactions.reduce((sum, txn) => {
      return txn.type === 'expense' ? sum + Math.abs(txn.amount) : sum;
    }, 0);
  }

  getBudgetUsagePercentage(): number {
    return this.monthlyBudget > 0 ? Math.min(100, (this.totalExpenses / this.monthlyBudget) * 100) : 0;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
