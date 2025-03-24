import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiBase = 'https://api.frankfurter.app/latest';

  constructor(private http: HttpClient) {}

  getConversionRate(targetCurrency: string): Observable<any> {
    const url = `${this.apiBase}?from=INR&to=${targetCurrency}`;
    return this.http.get(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching conversion rate:', error);
        return throwError(error);
      })
    );
  }
}
