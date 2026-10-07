import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput,
  IonButton, IonText, IonSpinner, IonIcon, IonBackButton, IonButtons, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput,
    IonButton, IonText, IonSpinner, IonIcon, IonBackButton, IonButtons
  ]
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  form: FormGroup;
  loading = false;

  constructor() {
    addIcons({ personAddOutline });
    this.form = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  private passwordMatch(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  async register() {
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password, displayName } = this.form.value;

    this.auth.register(email, password, displayName).subscribe({
      next: async () => {
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: 'Cuenta creada correctamente',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        this.router.navigate(['/businesses']);
      },
      error: async (err) => {
        this.loading = false;
        console.log(err);
        const toast = await this.toastCtrl.create({
          message: this.getErrorMessage(err.code),
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil';
      default:
        return 'Error al crear la cuenta';
    }
  }
}
