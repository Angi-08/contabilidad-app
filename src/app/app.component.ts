import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  homeOutline, businessOutline, listOutline, pricetagsOutline,
  barChartOutline, logOutOutline, addCircleOutline, walletOutline,
  cloudOfflineOutline
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';
import { BusinessService } from './core/services/business.service';
import { NetworkService } from './core/services/network.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
    IonFooter, IonButton, RouterLink, RouterLinkActive
  ]
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private businessService = inject(BusinessService);
  network = inject(NetworkService);
  private router = inject(Router);

  constructor() {
    addIcons({
      homeOutline, businessOutline, listOutline, pricetagsOutline,
      barChartOutline, logOutOutline, addCircleOutline, walletOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit() {
    // Cargar negocios y seleccionar el primero si no hay uno guardado
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

  logout() {
    this.auth.logout().subscribe(() => {
      this.businessService.setSelectedBusiness(null);
      this.router.navigate(['/login']);
    });
  }

  get selectedBusinessName(): string {
    return this.businessService.selectedBusiness()?.name || 'Sin negocio';
  }
}
