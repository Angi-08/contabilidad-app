import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonRefresher, IonRefresherContent, IonChip
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { addIcons } from 'ionicons';
import {
  trendingUpOutline, trendingDownOutline, walletOutline,
  addOutline, arrowForwardOutline, listOutline,
  businessOutline,
  calendarOutline
} from 'ionicons/icons';
import { startOfMonth, endOfMonth } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
    IonLabel, IonIcon, IonButton, IonRefresher, IonRefresherContent, IonChip
  ]
})
export class DashboardPage implements OnInit {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);

  income = computed(() => this.transactionService.sumByType(this.transactions(), 'income'));
  expenses = computed(() => this.transactionService.sumByType(this.transactions(), 'expense'));
  balance = computed(() => this.income() - this.expenses());

  recentTransactions = computed(() => this.transactions().slice(0, 8));

  constructor() {
    addIcons({
      trendingUpOutline, trendingDownOutline, walletOutline,
      addOutline, arrowForwardOutline, listOutline, businessOutline, calendarOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(event?: any) {
    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) {
      this.loading.set(false);
      event?.target?.complete();
      return;
    }

    this.loading.set(true);
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    this.transactionService.getTransactionsByDateRange(businessId, start, end).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
        event?.target?.complete();
      },
      error: error => {
        console.error('Error cargando dashboard:', error);
        this.transactions.set([]);
        this.loading.set(false);
        event?.target?.complete();
      }
    });
  }

  get selectedBusiness() {
    return this.businessService.selectedBusiness();
  }

  get currency(): string {
    return this.selectedBusiness?.currency || 'COP';
  }
}
