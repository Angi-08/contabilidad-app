import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, IonItem, IonInput, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trendingUpOutline, trendingDownOutline, pricetagOutline } from 'ionicons/icons';
import { CategoryType } from '../../../core/models/category.model';

@Component({
  selector: 'app-create-category-modal',
  templateUrl: './create-category-modal.component.html',
  styleUrls: ['./create-category-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, IonItem, IonInput, IonSegment, IonSegmentButton, IonLabel]
})
export class CreateCategoryModalComponent {
  name = '';
  type: CategoryType = 'expense';

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, trendingUpOutline, trendingDownOutline, pricetagOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  create() {
    if (!this.name.trim()) return;

    this.modalCtrl.dismiss({
      name: this.name.trim(),
      type: this.type
    });
  }
}