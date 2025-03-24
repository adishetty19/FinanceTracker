import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SelectedAmountService } from '../../services/selected-amount.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.css']
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  amount: number = 0; 
  targetCurrency: string = 'USD';
  convertedAmount: number | null = null;
  loading: boolean = false;

  private sub!: Subscription;

  constructor(
    private selectedAmountService: SelectedAmountService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.sub = this.selectedAmountService.selectedAmount$.subscribe(value => {
      if (value) {
        this.amount = value;
      }
    });
  }

  convertCurrency(): void {
    this.loading = true;
    this.currencyService.getConversionRate(this.targetCurrency).subscribe({
      next: (result: any) => {
        const rate = result.rates[this.targetCurrency];
        this.convertedAmount = this.amount * rate;
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
