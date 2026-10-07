import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton, IonItemSliding,
  IonItemOptions, IonItemOption, IonSegment, IonSegmentButton, IonChip,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../core/models/category.model';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, pricetagOutline } from 'ionicons/icons';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton, IonItemSliding,
    IonItemOptions, IonItemOption, IonSegment, IonSegmentButton, IonChip
  ]
})
export class CategoriesPage implements OnInit {
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  categories = signal<Category[]>([]);
  filterType = signal<CategoryType | 'all'>('all');
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, trashOutline, pricetagOutline });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const type = this.filterType() === 'all' ? undefined : this.filterType() as CategoryType;

    this.categoryService.getCategories(businessId, type).subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(event: any) {
    this.filterType.set(event.detail.value);
    this.loadCategories();
  }

  async openCreateModal() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva categoría',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre de la categoría' },
        {
          name: 'type',
          type: 'radio',
          label: 'Ingreso',
          value: 'income',
          checked: true
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Gasto',
          value: 'expense'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            // Nota: con radios en alert el valor viene en data.type
            if (!data.name?.trim()) return false;
            this.createCategory(data.name.trim(), data.type || 'expense');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Versión mejorada del alert para tipo
  async openCreate() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva categoría',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Ingreso',
          handler: (data) => {
            if (data.name?.trim()) {
              this.createCategory(data.name.trim(), 'income');
            }
          }
        },
        {
          text: 'Gasto',
          handler: (data) => {
            if (data.name?.trim()) {
              this.createCategory(data.name.trim(), 'expense');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  createCategory(name: string, type: CategoryType) {
    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) return;

    this.categoryService.createCategory({ businessId, name, type }).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Categoría creada',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.loadCategories();
      }
    });
  }

  async confirmDelete(cat: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: `¿Eliminar "${cat.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (cat.id) {
              this.categoryService.deleteCategory(cat.id).subscribe(() => this.loadCategories());
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
