import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton, IonSpinner, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  walletOutline, mailOutline, lockClosedOutline, arrowForwardOutline, shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonItem, IonInput, IonButton, IonSpinner, IonIcon
  ]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  form: FormGroup;
  loading = false;

  constructor() {
    addIcons({
      walletOutline, mailOutline, lockClosedOutline,
      arrowForwardOutline, shieldCheckmarkOutline
    });

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: async (err) => {
        this.loading = false;
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
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      default:
        return 'Error al iniciar sesión';
    }
  }
}
