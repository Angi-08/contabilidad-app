import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { BusinessService } from '../../core/services/business.service';
import { Business } from '../../core/models/business.model';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircle, businessOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.page.html',
  styleUrls: ['./businesses.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton,
    IonItemSliding, IonItemOptions, IonItemOption
  ]
})
export class BusinessesPage implements OnInit {
  private businessService = inject(BusinessService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  businesses = signal<Business[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircle, businessOutline });
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
  }

  isSelected(business: Business): boolean {
    return this.businessService.selectedBusiness()?.id === business.id;
  }

  async openCreateModal() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo negocio',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre del negocio', attributes: { required: true } },
        { name: 'description', type: 'text', placeholder: 'Descripción (opcional)' },
        { name: 'currency', type: 'text', placeholder: 'Moneda (ej: MXN)', value: 'MXN' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (!data.name?.trim()) return false;
            this.createBusiness(data);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  createBusiness(data: any) {
    this.businessService.createBusiness({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      currency: data.currency?.trim() || 'MXN'
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
