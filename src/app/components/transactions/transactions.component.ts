import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { StorageService } from '../../services/storage.service';
import { SelectedAmountService } from '../../services/selected-amount.service';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: string[] = ['Food', 'Rent', 'Salary', 'Utilities', 'Entertainment'];
  currentTransaction: Transaction = {
    id: '',
    amount: 0,
    date: '',
    description: '',
    category: '',
    type: 'income'
  };
  editMode: boolean = false;
  searchText: string = '';
  searchDate: string = '';
  searchCategory: string = '';

  constructor(
    private storageService: StorageService,
    private selectedAmountService: SelectedAmountService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactions = this.storageService.getTransactions();
    this.applyFilter();
  }

  saveTransaction() {
    if (this.currentTransaction.type === 'expense' && this.currentTransaction.amount > 0) {
      this.currentTransaction.amount = -this.currentTransaction.amount;
    }
    if (this.editMode) {
      this.transactions = this.transactions.map(txn =>
        txn.id === this.currentTransaction.id ? this.currentTransaction : txn
      );
      this.editMode = false;
    } else {
      this.currentTransaction.id = Date.now().toString();
      this.transactions.push({ ...this.currentTransaction });
    }
    this.storageService.saveTransactions(this.transactions);
    this.resetForm();
    this.applyFilter();
  }

  editTransaction(txn: Transaction) {
    this.currentTransaction = { ...txn };
    this.editMode = true;
  }

  deleteTransaction(id: string) {
    this.transactions = this.transactions.filter(txn => txn.id !== id);
    this.storageService.saveTransactions(this.transactions);
    this.applyFilter();
  }

  resetForm() {
    this.currentTransaction = {
      id: '',
      amount: 0,
      date: '',
      description: '',
      category: '',
      type: 'income'
    };
    this.editMode = false;
  }

  applyFilter() {
    this.filteredTransactions = this.transactions.filter(txn => {
      const matchText = this.searchText ? txn.description.toLowerCase().includes(this.searchText.toLowerCase()) : true;
      const matchDate = this.searchDate ? txn.date === this.searchDate : true;
      const matchCategory = this.searchCategory ? txn.category === this.searchCategory : true;
      return matchText && matchDate && matchCategory;
    });
  }

  exportCSV() {
    const csvData = Papa.unparse(this.transactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transactions.csv');
  }

  selectAmount(amount: number) {
    this.selectedAmountService.setAmount(Math.abs(amount));
  }
}
