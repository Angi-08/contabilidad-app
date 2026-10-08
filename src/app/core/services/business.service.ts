import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Business } from '../models/business.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  // Negocio actualmente seleccionado (persistido en localStorage también)
  selectedBusiness = signal<Business | null>(null);

  private readonly COLLECTION = 'businesses';

  constructor() {
    // Recuperar negocio seleccionado de localStorage al iniciar
    const saved = localStorage.getItem('selectedBusinessId');
    if (saved) {
      // Se cargará cuando se obtengan los negocios
    }
  }

  getBusinesses(): Observable<Business[]> {
    const uid = this.auth.currentUid;
    if (!uid) return from([]);

    const q = query(
      collection(this.firestore, this.COLLECTION),
      where('ownerId', '==', uid)
    );

    return collectionData(q, { idField: 'id' }) as Observable<Business[]>;
  }

  createBusiness(data: Partial<Business>): Observable<string> {
    const uid = this.auth.currentUid;
    if (!uid) throw new Error('Usuario no autenticado');

    const business: Business = {
      name: data.name!,
      description: data.description || '',
      currency: data.currency || 'MXN',
      ownerId: uid,
      createdAt: Timestamp.now(),
      isActive: true
    };

    return from(addDoc(collection(this.firestore, this.COLLECTION), business)).pipe(
      map(ref => ref.id)
    );
  }

  updateBusiness(id: string, data: Partial<Business>): Observable<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    return from(updateDoc(ref, {
      ...data,
      updatedAt: Timestamp.now()
    }));
  }

  deleteBusiness(id: string): Observable<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    return from(deleteDoc(ref));
  }

  setSelectedBusiness(business: Business | null) {
    this.selectedBusiness.set(business);
    if (business?.id) {
      localStorage.setItem('selectedBusinessId', business.id);
    } else {
      localStorage.removeItem('selectedBusinessId');
    }
  }

  getSelectedBusinessId(): string | null {
    return this.selectedBusiness()?.id || localStorage.getItem('selectedBusinessId');
  }
}
