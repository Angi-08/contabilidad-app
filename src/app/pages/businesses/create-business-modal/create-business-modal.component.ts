import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { businessOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-create-business-modal',
  templateUrl: './create-business-modal.component.html',
  styleUrls: ['./create-business-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption, IonLabel]
})
export class CreateBusinessModalComponent {
  name = '';
  description = '';
  currency = 'MXN';

  constructor(private modalCtrl: ModalController) {
    addIcons({ businessOutline, closeOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  create() {
    if (!this.name.trim()) return;

    this.modalCtrl.dismiss({
      name: this.name.trim(),
      description: this.description.trim(),
      currency: this.currency
    });
  }
}