import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
  IonLabel, IonSelect, IonSelectOption, IonButton
} from '@ionic/angular/standalone';
import { BusinessService } from '../../core/services/business.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
    IonLabel, IonSelect, IonSelectOption, IonButton
  ]
})
export class ReportsPage implements OnInit {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);

  transactions = signal<Transaction[]>([]);
  period = signal<'current' | 'previous' | 'year'>('current');
  loading = signal(false);

  income = computed(() => this.transactionService.sumByType(this.transactions(), 'income'));
  expenses = computed(() => this.transactionService.sumByType(this.transactions(), 'expense'));
  balance = computed(() => this.income() - this.expenses());

  // Agrupación por categoría
  byCategory = computed(() => {
    const map = new Map<string, { name: string; type: string; total: number }>();
    for (const t of this.transactions()) {
      const key = t.categoryId || 'sin-categoria';
      const existing = map.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        map.set(key, {
          name: t.categoryName || 'Sin categoría',
          type: t.type,
          total: t.amount
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  });

  ngOnInit() {
    this.loadReport();
  }

  onPeriodChange(event: any) {
    this.period.set(event.detail.value);
    this.loadReport();
  }

  loadReport() {
    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) return;

    this.loading.set(true);
    let start: Date, end: Date;
    const now = new Date();

    switch (this.period()) {
      case 'previous':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    this.transactionService.getTransactionsByDateRange(businessId, start, end).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get currency(): string {
    return this.businessService.selectedBusiness()?.currency || 'MXN';
  }

  get periodLabel(): string {
    switch (this.period()) {
      case 'previous': return 'Mes anterior';
      case 'year': return 'Año actual';
      default: return 'Mes actual';
    }
  }
}
