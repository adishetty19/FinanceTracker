import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';
import { Transaction } from '../../models/transaction.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-investment-roi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment-roi.component.html',
  styleUrls: ['./investment-roi.component.css']
})
export class InvestmentRoiComponent implements OnInit {
  // User input fields
  initialAmount: number = 0;
  investmentType: string = 'Mutual Fund';
  numberOfYears: number = 1;
  stockSymbol: string = '';

  finalAmount: number | null = null;
  roiPercentage: number | null = null;

  availableSavings: number = 0;

  private defaultRates: { [key: string]: number } = {
    'Mutual Fund': 0.12,     
    'Fixed Deposit': 0.07     
  };

  private defaultStockRate: number = 0.15; 

  private transactionsSub!: Subscription;

  constructor(private http: HttpClient, private storageService: StorageService) {}

  ngOnInit(): void {
    this.transactionsSub = this.storageService.transactions$.subscribe((txns: Transaction[]) => {
      const totalIncome = txns
        .filter(txn => txn.amount > 0)
        .reduce((sum, txn) => sum + txn.amount, 0);
        
      const totalExpenses = txns
        .filter(txn => txn.amount < 0)
        .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
      
      this.availableSavings = totalIncome - totalExpenses;
    });
  }

  calculateInvestment(): void {
    if (this.initialAmount > this.availableSavings) {
      alert(
        `Initial investment cannot exceed available savings of ${this.availableSavings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}.`
      );
      return;
    }
    
    if (this.investmentType === 'Stock') {
      if (!this.stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
      }
      const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${this.stockSymbol}&outputsize=compact&apikey=SOBACX5DITWSH7KY`;
      
      this.http.get(apiUrl).subscribe({
        next: (response: any) => {
          const timeSeries = response["Time Series (Daily)"];
          if (!timeSeries) {
            alert('Invalid stock data received.');
            return;
          }
          const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          const latestDate = dates[0];
          const latestData = timeSeries[latestDate];
          const closingPrice = parseFloat(latestData["4. close"]);
          if (isNaN(closingPrice)) {
            alert('Error parsing the stock closing price.');
            return;
          }
          const growthRate = this.defaultStockRate;
          this.finalAmount = this.initialAmount * Math.pow(1 + growthRate, this.numberOfYears);
          this.roiPercentage = ((this.finalAmount - this.initialAmount) / this.initialAmount) * 100;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          alert('Failed to fetch stock data. Please try again later.');
        }
      });
    } else {
      const rate = this.defaultRates[this.investmentType];
      this.finalAmount = this.initialAmount * Math.pow(1 + rate, this.numberOfYears);
      this.roiPercentage = ((this.finalAmount - this.initialAmount) / this.initialAmount) * 100;
    }
  }
  
  ngOnDestroy(): void {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }
  }
}
