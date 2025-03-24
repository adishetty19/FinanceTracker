import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-backup-restore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-backup-restore.component.html',
  styleUrls: ['./data-backup-restore.component.css']
})
export class DataBackupRestoreComponent {
  downloadBackup() {
    const backupData = {
      transactions: localStorage.getItem('transactions'),
      budget: localStorage.getItem('budget'),
      savingsGoal: localStorage.getItem('savingsGoal')
    };
    const backupStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  restoreBackup(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const backupData = JSON.parse(e.target.result);
          if (backupData.transactions) localStorage.setItem('transactions', backupData.transactions);
          if (backupData.budget) localStorage.setItem('budget', backupData.budget);
          if (backupData.savingsGoal) localStorage.setItem('savingsGoal', backupData.savingsGoal);
          alert('Backup restored successfully!');
        } catch (err) {
          alert('Failed to restore backup.');
        }
      };
      reader.readAsText(file);
    }
  }
}
