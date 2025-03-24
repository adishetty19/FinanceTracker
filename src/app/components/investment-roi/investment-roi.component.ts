import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-investment-roi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment-roi.component.html',
  styleUrls: ['./investment-roi.component.css']
})
export class InvestmentRoiComponent implements OnInit {
  initialAmount: number = 0;
  investmentType: string = 'Mutual Fund';
  numberOfYears: number = 1;
  finalAmount: number | null = null;
  roiPercentage: number | null = null;
  
  availableSavings: number = 0;

  private rates: { [key: string]: number } = {
    'Mutual Fund': 0.12, 
    'Fixed Deposit': 0.07 
  };

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    const savingsStr = localStorage.getItem('netSavings');
    if (savingsStr) {
      this.availableSavings = parseFloat(savingsStr);
    } else {
      this.availableSavings = 0;
    }
  }

  calculateInvestment(): void {
    if (this.initialAmount > this.availableSavings) {
      alert('Initial investment cannot exceed available savings of ' + 
            this.availableSavings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }));
      return;
    }
    
    const rate = this.rates[this.investmentType];
    this.finalAmount = this.initialAmount * Math.pow((1 + rate), this.numberOfYears);
    this.roiPercentage = ((this.finalAmount - this.initialAmount) / this.initialAmount) * 100;
  }
}
