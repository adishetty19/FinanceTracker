import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // for filtering inputs
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { Transaction } from '../../models/transaction.model';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartItem } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  transactions: Transaction[] = [];
  totalIncome: number = 0;
  totalExpenses: number = 0;
  netSavings: number = 0;

  monthlyBudget: number | null = null;
  budgetUsage: number = 0;
  savingsGoalTarget: number | null = null;
  savingsGoalProgress: number = 0;

  startDate: string = '';
  endDate: string = '';
  selectedCategory: string = '';
  categories: string[] = [];

  @ViewChild('savingsLineChart', { static: true }) savingsLineChart!: ElementRef<HTMLCanvasElement>;
  savingsChart!: Chart;

  @ViewChild('expensePieChart', { static: true }) expensePieChart!: ElementRef<HTMLCanvasElement>;
  expenseChart!: Chart;

  @ViewChild('incomeExpenseBarChart', { static: true }) incomeExpenseBarChart!: ElementRef<HTMLCanvasElement>;
  incomeExpenseChart!: Chart;

  monthlySavings: { label: string; value: number }[] = [];

  private transactionsSub!: Subscription;
  private viewInitialized = false;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.transactionsSub = this.storageService.transactions$.subscribe((txns: Transaction[]) => {
      this.transactions = txns;
      this.extractCategories();
      const filtered = this.filterTransactions();
      this.calculateMetrics(filtered);
      this.calculateMonthlySavings(filtered);
      if (this.viewInitialized) {
        this.updateCharts();
      }
    });

    const mb = localStorage.getItem('monthlyBudget');
    if (mb !== null) {
      this.monthlyBudget = parseFloat(mb);
    }
    const sgt = localStorage.getItem('savingsGoalTarget');
    if (sgt !== null) {
      this.savingsGoalTarget = parseFloat(sgt);
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.updateCharts();
  }

  ngOnDestroy(): void {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }
  }

  extractCategories(): void {
    const catSet = new Set<string>();
    this.transactions.forEach(txn => {
      if (txn.category) {
        catSet.add(txn.category);
      }
    });
    this.categories = Array.from(catSet).sort();
  }

  filterTransactions(): Transaction[] {
    let filtered = [...this.transactions];
    if (this.startDate) {
      filtered = filtered.filter(txn => txn.date >= this.startDate);
    }
    if (this.endDate) {
      filtered = filtered.filter(txn => txn.date <= this.endDate);
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(txn => txn.category === this.selectedCategory);
    }
    return filtered;
  }

  calculateMetrics(filtered: Transaction[]): void {
    this.totalIncome = filtered.filter(txn => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0);
    this.totalExpenses = filtered.filter(txn => txn.amount < 0).reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
    this.netSavings = this.totalIncome - this.totalExpenses;

    if (this.monthlyBudget && this.monthlyBudget > 0) {
      this.budgetUsage = Math.min(100, (this.totalExpenses / this.monthlyBudget) * 100);
    } else {
      this.budgetUsage = 0;
    }
    if (this.savingsGoalTarget && this.savingsGoalTarget > 0) {
      this.savingsGoalProgress = Math.min(100, (this.netSavings / this.savingsGoalTarget) * 100);
    } else {
      this.savingsGoalProgress = 0;
    }
  }

  calculateMonthlySavings(filtered: Transaction[]): void {
    const grouped: { [month: string]: number } = {};
    filtered.forEach(txn => {
      const month = txn.date.substring(0, 7);
      grouped[month] = (grouped[month] || 0) + txn.amount;
    });
    const months = Object.keys(grouped).sort();
    let cumulative = 0;
    this.monthlySavings = months.map(month => {
      cumulative += grouped[month];
      return { label: month, value: cumulative };
    });
  }

  computeMovingAverage(data: number[], period: number): number[] {
    const averages: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - period + 1);
      const windowData = data.slice(start, i + 1);
      const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length;
      averages.push(avg);
    }
    return averages;
  }

  updateCharts(): void {
    this.updateSavingsChart();
    this.updateIncomeExpenseChart();
    this.updateExpenseChart();
  }

  updateSavingsChart(): void {
    if (!this.savingsLineChart?.nativeElement) return;
    const labels = this.monthlySavings.map(ms => ms.label);
    const dataPoints = this.monthlySavings.map(ms => ms.value);
    const movingAverage = this.computeMovingAverage(dataPoints, 3);

    const chartData: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cumulative Savings (₹)',
            data: dataPoints,
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.2
          },
          {
            label: '3-Month Moving Average',
            data: movingAverage,
            fill: false,
            borderColor: 'rgba(255, 159, 64, 1)',
            borderDash: [5, 5],
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } }
      }
    };

    if (this.savingsChart) {
      this.savingsChart.destroy();
    }
    const chartItem: ChartItem = this.savingsLineChart.nativeElement;
    this.savingsChart = new Chart(chartItem, chartData);
  }

  updateIncomeExpenseChart(): void {
    if (!this.incomeExpenseBarChart?.nativeElement) return;
    const incomeGrouped: { [month: string]: number } = {};
    const expenseGrouped: { [month: string]: number } = {};

    this.transactions.forEach(txn => {
      const month = txn.date.substring(0, 7);
      if (txn.amount > 0) {
        incomeGrouped[month] = (incomeGrouped[month] || 0) + txn.amount;
      } else {
        expenseGrouped[month] = (expenseGrouped[month] || 0) + Math.abs(txn.amount);
      }
    });

    const monthsSet = new Set<string>([...Object.keys(incomeGrouped), ...Object.keys(expenseGrouped)]);
    const months = Array.from(monthsSet).sort();

    const incomeData = months.map(month => incomeGrouped[month] || 0);
    const expenseData = months.map(month => expenseGrouped[month] || 0);

    const barData: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income (₹)',
            data: incomeData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          },
          {
            label: 'Expenses (₹)',
            data: expenseData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const selectedMonth = months[index];
            this.showTransactionsForMonth(selectedMonth);
          }
        }
      }
    };

    if (this.incomeExpenseChart) {
      this.incomeExpenseChart.destroy();
    }
    const chartItem: ChartItem = this.incomeExpenseBarChart.nativeElement;
    this.incomeExpenseChart = new Chart(chartItem, barData);
  }

  updateExpenseChart(): void {
    if (!this.expensePieChart?.nativeElement) return;
    const categoryTotals: { [category: string]: number } = {};
    this.transactions.forEach(txn => {
      if (txn.amount < 0) {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + Math.abs(txn.amount);
      }
    });
    const labels = Object.keys(categoryTotals);
    const dataPoints = labels.map(label => categoryTotals[label]);

    const pieData: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        cutout: '0%'
      }
    };

    if (this.expenseChart) {
      this.expenseChart.destroy();
    }
    const chartItem: ChartItem = this.expensePieChart.nativeElement;
    this.expenseChart = new Chart(chartItem, pieData as any);
  }

  showTransactionsForMonth(selectedMonth: string): void {
    console.log(`Drill-down for month: ${selectedMonth}`);
  }
}
