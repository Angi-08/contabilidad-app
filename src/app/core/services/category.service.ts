import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, getDocs } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import { Category, CategoryType } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);
  private readonly COLLECTION = 'categories';

  getCategories(businessId: string, type?: CategoryType): Observable<Category[]> {
    const conditions = [where('businessId', '==', businessId)];

    if (type) conditions.push(where('type', '==', type));

    return collectionData(
      query(collection(this.firestore, this.COLLECTION), ...conditions),
      { idField: 'id' }
    ).pipe(
      map(categories => (categories as Category[]).sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  createCategory(data: Partial<Category>): Observable<string> {
    const name = data.name!.trim();

    return from(getDocs(query(
      collection(this.firestore, this.COLLECTION),
      where('businessId', '==', data.businessId),
      where('type', '==', data.type)
    ))).pipe(
      switchMap(snapshot => {
        const exists = snapshot.docs.some(doc => {
          const category = doc.data() as Category;
          return category.name.trim().toLowerCase() === name.toLowerCase();
        });

        if (exists) return throwError(() => new Error('CATEGORY_EXISTS'));

        const category: Category = {
          businessId: data.businessId!,
          name,
          type: data.type!,
          color: data.color || (data.type === 'income' ? '#2e7d32' : '#c62828'),
          icon: data.icon || (data.type === 'income' ? 'trending-up' : 'trending-down'),
          createdAt: Timestamp.now()
        };

        return from(addDoc(collection(this.firestore, this.COLLECTION), category)).pipe(
          map(ref => ref.id)
        );
      })
    );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<void> {
    return from(updateDoc(doc(this.firestore, this.COLLECTION, id), data));
  }

  deleteCategory(id: string, businessId: string): Observable<void> {
    return from(getDocs(query(
      collection(this.firestore, 'transactions'),
      where('businessId', '==', businessId),
      where('categoryId', '==', id)
    ))).pipe(
      switchMap(snapshot => {
        if (!snapshot.empty) return throwError(() => new Error('CATEGORY_IN_USE'));

        return from(deleteDoc(doc(this.firestore, this.COLLECTION, id)));
      })
    );
  }
}