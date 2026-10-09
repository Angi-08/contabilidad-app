import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton, IonItemSliding,
  IonItemOptions, IonItemOption, IonSegment, IonSegmentButton, IonChip,
  AlertController, ToastController, IonSpinner, ModalController, IonButton
} from '@ionic/angular/standalone';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../core/models/category.model';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, pricetagOutline } from 'ionicons/icons';
import { CreateCategoryModalComponent } from './create-category-modal/create-category-modal.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule, CreateCategoryModalComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton, IonItemSliding,
    IonItemOptions, IonItemOption, IonSegment, IonSegmentButton, IonChip,
    IonSpinner, IonButton
  ]
})
export class CategoriesPage implements OnInit {
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

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
      this.categories.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    const type = this.filterType() === 'all' ? undefined : this.filterType();

    this.categoryService.getCategories(businessId, type === 'all' ? undefined : type).subscribe({
      next: data => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Error cargando categorías:', error);
        this.categories.set([]);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(event: any) {
    this.filterType.set(event.detail.value);
    this.loadCategories();
  }

  async openCreate() {
    const modal = await this.modalCtrl.create({
      component: CreateCategoryModalComponent,
      cssClass: 'category-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.name && data?.type) this.createCategory(data.name, data.type);
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
      },
      error: async error => {
        const toast = await this.toastCtrl.create({
          message: error.message === 'CATEGORY_EXISTS'
            ? 'Ya existe una categoría con ese nombre y tipo'
            : 'No se pudo crear la categoría',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
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
            const businessId = this.businessService.getSelectedBusinessId();
  
            if (!cat.id || !businessId) return;
  
            this.categoryService.deleteCategory(cat.id, businessId).subscribe({
              next: async () => {
                const toast = await this.toastCtrl.create({
                  message: 'Categoría eliminada',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
                this.loadCategories();
              },
              error: async error => {
                const toast = await this.toastCtrl.create({
                  message: error.message === 'CATEGORY_IN_USE'
                    ? 'No puedes eliminar esta categoría porque tiene movimientos asociados'
                    : 'No se pudo eliminar la categoría',
                  duration: 3000,
                  color: 'danger'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
  
    await alert.present();
  }
}