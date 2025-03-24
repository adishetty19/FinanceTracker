import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private transactionKey = 'transactions';

  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.getTransactionsFromLocalStorage());
  transactions$ = this.transactionsSubject.asObservable();

  private getTransactionsFromLocalStorage(): Transaction[] {
    const data = localStorage.getItem(this.transactionKey);
    try {
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing transactions:', error);
      return [];
    }
  }

  getTransactions(): Transaction[] {
    return this.getTransactionsFromLocalStorage();
  }

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(this.transactionKey, JSON.stringify(transactions));
    this.transactionsSubject.next(transactions);
  }
}
