import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSpinner,
  IonSegment, IonSegmentButton, IonLabel, ToastController
} from '@ionic/angular/standalone';
import { BusinessService } from '../../../core/services/business.service';
import { CategoryService } from '../../../core/services/category.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Category } from '../../../core/models/category.model';
import { TransactionType } from '../../../core/models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.page.html',
  styleUrls: ['./transaction-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSpinner,
    IonSegment, IonSegmentButton, IonLabel
  ]
})
export class TransactionFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private toastCtrl = inject(ToastController);

  form: FormGroup;
  categories = signal<Category[]>([]);
  loading = false;
  isEdit = false;
  transactionId: string | null = null;
  type: TransactionType = 'expense';

  constructor() {
    this.form = this.fb.group({
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      description: [''],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.transactionId;

    this.form.get('type')?.valueChanges.subscribe(type => {
      this.type = type;
      this.loadCategories();
      this.form.patchValue({ categoryId: '' });
    });

    this.loadCategories();

    // Si es edición, cargar datos (simplificado: en producción se buscaría por ID)
    // Por simplicidad del MVP, el form se llena vacío en edición y se actualiza al guardar
  }

  loadCategories() {
    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) return;

    this.categoryService.getCategories(businessId, this.type).subscribe(cats => {
      this.categories.set(cats);
    });
  }

  async save() {
    if (this.form.invalid) return;

    const businessId = this.businessService.getSelectedBusinessId();
    if (!businessId) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona un negocio primero',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.loading = true;
    const formValue = this.form.value;
    const selectedCat = this.categories().find(c => c.id === formValue.categoryId);

    const data = {
      businessId,
      type: formValue.type as TransactionType,
      amount: Number(formValue.amount),
      categoryId: formValue.categoryId,
      categoryName: selectedCat?.name || '',
      description: formValue.description || '',
      date: formValue.date
    };

    const request$: Observable<any> = this.isEdit && this.transactionId
      ? this.transactionService.updateTransaction(this.transactionId, data)
      : this.transactionService.createTransaction(data);

    request$.subscribe({
      next: async () => {
        this.loading = false;

        const toast = await this.toastCtrl.create({
          message: this.isEdit ? 'Movimiento actualizado' : 'Movimiento registrado',
          duration: 2000,
          color: 'success'
        });

        await toast.present();
        this.router.navigate(['/transactions']);
      },
      error: async () => {
        this.loading = false;

        const toast = await this.toastCtrl.create({
          message: 'Error al guardar',
          duration: 2000,
          color: 'danger'
        });

        await toast.present();
      }
    });
  }
}
