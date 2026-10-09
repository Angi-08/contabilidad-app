import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent,
  IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, listOutline, trendingUpOutline, trendingDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
    IonItemSliding, IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent, IonSpinner
  ]
})
export class TransactionsPage implements OnInit {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, trashOutline, listOutline, trendingUpOutline, trendingDownOutline });
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions(event?: any) {
    const businessId = this.businessService.getSelectedBusinessId();

    if (!businessId) {
      this.loading.set(false);
      event?.target?.complete();
      return;
    }

    this.loading.set(true);

    this.transactionService.getTransactions(businessId, 100).subscribe({
      next: data => {
        this.transactions.set(data);
        this.loading.set(false);
        event?.target?.complete();
      },
      error: error => {
        console.error('Error cargando movimientos:', error);
        this.transactions.set([]);
        this.loading.set(false);
        event?.target?.complete();
      }
    });
  }

  get currency(): string {
    return this.businessService.selectedBusiness()?.currency || 'MXN';
  }

  async confirmDelete(t: Transaction) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar movimiento',
      message: '¿Seguro que quieres eliminar este movimiento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteTransaction(t) }
      ]
    });

    await alert.present();
  }

  deleteTransaction(t: Transaction) {
    if (!t.id) return;

    this.transactionService.deleteTransaction(t.id).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Movimiento eliminado',
          duration: 2000,
          color: 'success'
        });

        await toast.present();
        this.loadTransactions();
      }
    });
  }

  formatDate(date: any): Date {
    return date?.toDate ? date.toDate() : new Date(date);
  }
}