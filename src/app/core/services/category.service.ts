import { Injectable, inject } from '@angular/core';
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
import { Category, CategoryType } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);
  private readonly COLLECTION = 'categories';

  getCategories(businessId: string, type?: CategoryType): Observable<Category[]> {
    let q = query(
      collection(this.firestore, this.COLLECTION),
      where('businessId', '==', businessId),
      orderBy('name')
    );

    // Nota: si se filtra por type, se necesita índice compuesto en Firebase
    if (type) {
      q = query(
        collection(this.firestore, this.COLLECTION),
        where('businessId', '==', businessId),
        where('type', '==', type),
        orderBy('name')
      );
    }

    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  createCategory(data: Partial<Category>): Observable<string> {
    const category: Category = {
      businessId: data.businessId!,
      name: data.name!,
      type: data.type!,
      color: data.color || (data.type === 'income' ? '#2e7d32' : '#c62828'),
      icon: data.icon || (data.type === 'income' ? 'trending-up' : 'trending-down'),
      createdAt: Timestamp.now()
    };

    return from(addDoc(collection(this.firestore, this.COLLECTION), category)).pipe(
      map(ref => ref.id)
    );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    return from(updateDoc(ref, data));
  }

  deleteCategory(id: string): Observable<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    return from(deleteDoc(ref));
  }
}
