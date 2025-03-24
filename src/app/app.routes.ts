import { Routes } from '@angular/router';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetPlanningComponent } from './components/budget-planning/budget-planning.component';
import { SavingsGoalComponent } from './components/savings-goal/savings-goal.component';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { InvestmentRoiComponent } from './components/investment-roi/investment-roi.component';
import { DataBackupRestoreComponent } from './components/data-backup-restore/data-backup-restore.component';

export const routes: Routes = [
  { path: '', redirectTo: 'transactions', pathMatch: 'full' },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'budget', component: BudgetPlanningComponent },
  { path: 'savings', component: SavingsGoalComponent },
  { path: 'converter', component: CurrencyConverterComponent },
  { path: 'roi', component: InvestmentRoiComponent },
  { path: 'backup', component: DataBackupRestoreComponent }
];
