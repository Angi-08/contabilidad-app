import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Network } from '@capacitor/network';
import { fromEvent, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  isOnline = signal(true);
  private sub?: Subscription;

  constructor() {
    this.init();
  }

  private async init() {
    // Estado inicial
    try {
      const status = await Network.getStatus();
      this.isOnline.set(status.connected);
    } catch {
      // Fallback para web
      this.isOnline.set(navigator.onLine);
    }

    // Listener Capacitor
    Network.addListener('networkStatusChange', status => {
      this.isOnline.set(status.connected);
    });

    // Fallback para navegador
    this.sub = fromEvent(window, 'online').subscribe(() => this.isOnline.set(true));
    fromEvent(window, 'offline').subscribe(() => this.isOnline.set(false));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    Network.removeAllListeners();
  }
}
