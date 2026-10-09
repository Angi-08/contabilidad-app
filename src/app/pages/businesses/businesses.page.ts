import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController,
  ModalController, IonSpinner
} from '@ionic/angular/standalone';
import { BusinessService } from '../../core/services/business.service';
import { Business } from '../../core/models/business.model';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircle, businessOutline, checkmarkOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CreateBusinessModalComponent } from './create-business-modal/create-business-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.page.html',
  styleUrls: ['./businesses.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
    IonItemSliding, IonItemOptions, IonItemOption, IonSpinner,
    CreateBusinessModalComponent
  ]
})
export class BusinessesPage implements OnInit {
  private businessService = inject(BusinessService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

  businesses = signal<Business[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircle, businessOutline, checkmarkOutline });
  }

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.loading.set(true);
    this.businessService.getBusinesses().subscribe({
      next: (data) => {
        this.businesses.set(data);
        this.loading.set(false);

        // Si no hay negocio seleccionado, seleccionar el primero
        if (data.length > 0 && !this.businessService.selectedBusiness()) {
          this.selectBusiness(data[0]);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectBusiness(business: Business) {
    this.businessService.setSelectedBusiness(business);
    this.router.navigate(['/dashboard']);
  }

  isSelected(business: Business): boolean {
    return this.businessService.selectedBusiness()?.id === business.id;
  }

  async openCreateModal() {
    const modal = await this.modalCtrl.create({
      component: CreateBusinessModalComponent,
      cssClass: 'business-modal'
    });
  
    await modal.present();
  
    const { data } = await modal.onWillDismiss();
  
    if (data) this.createBusiness(data);
  }

  createBusiness(data: any) {
    this.businessService.createBusiness({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      currency: data.currency?.trim() || 'COP'
    }).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Negocio creado',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.loadBusinesses();
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al crear el negocio',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async confirmDelete(business: Business) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar negocio',
      message: `¿Seguro que quieres eliminar "${business.name}"? Se perderán todos sus datos.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteBusiness(business)
        }
      ]
    });
    await alert.present();
  }

  deleteBusiness(business: Business) {
    if (!business.id) return;
    this.businessService.deleteBusiness(business.id).subscribe({
      next: async () => {
        if (this.isSelected(business)) {
          this.businessService.setSelectedBusiness(null);
        }
        const toast = await this.toastCtrl.create({
          message: 'Negocio eliminado',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.loadBusinesses();
      }
    });
  }
}
