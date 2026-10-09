import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton,
  MenuController
} from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  homeOutline, businessOutline, listOutline, pricetagsOutline,
  barChartOutline, logOutOutline, walletOutline, cloudOfflineOutline,
  swapHorizontalOutline
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';
import { BusinessService } from './core/services/business.service';
import { NetworkService } from './core/services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
    IonFooter, IonButton, RouterLink, RouterLinkActive
  ]
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private businessService = inject(BusinessService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  network = inject(NetworkService);
  
  constructor() {
    addIcons({
      homeOutline, businessOutline, listOutline, pricetagsOutline,
      barChartOutline, logOutOutline, walletOutline,
      cloudOfflineOutline, swapHorizontalOutline
    });
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.businessService.getBusinesses().subscribe(businesses => {
          if (businesses.length > 0 && !this.businessService.selectedBusiness()) {
            const savedId = localStorage.getItem('selectedBusinessId');
            const found = businesses.find(b => b.id === savedId) || businesses[0];
            this.businessService.setSelectedBusiness(found);
          }
        });
      }
    });
  }

  async logout() {
    await this.menuCtrl.close();

    this.auth.logout().subscribe(() => {
      this.businessService.setSelectedBusiness(null);
      this.router.navigate(['/login']);
    });
  }

  get selectedBusinessName(): string {
    return this.businessService.selectedBusiness()?.name || 'Sin negocio';
  }

  async changeBusiness() {
    await this.menuCtrl.close();
    this.router.navigate(['/businesses']);
  }
}