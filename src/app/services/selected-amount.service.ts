import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedAmountService {
  private amountSource = new BehaviorSubject<number>(0);
  selectedAmount$ = this.amountSource.asObservable();

  setAmount(amount: number): void {
    this.amountSource.next(amount);
  }
}
