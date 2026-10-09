import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, limit } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private readonly COLLECTION = 'transactions';

  getTransactions(businessId: string, maxResults = 50): Observable<Transaction[]> {
    const q = query(
      collection(this.firestore, this.COLLECTION),
      where('businessId', '==', businessId),
      limit(maxResults)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(transactions => (transactions as Transaction[]).sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      }))
    );
  }

  getTransactionsByDateRange(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Observable<Transaction[]> {
    const q = query(
      collection(this.firestore, this.COLLECTION),
      where('businessId', '==', businessId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );
  
    return collectionData(q, { idField: 'id' }).pipe(
      map(transactions => (transactions as Transaction[]).sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      }))
    );
  } 

  createTransaction(data: Partial<Transaction>): Observable<string> {
    const uid = this.auth.currentUid;
    if (!uid) throw new Error('Usuario no autenticado');

    const transaction: Transaction = {
      businessId: data.businessId!,
      type: data.type!,
      amount: data.amount!,
      categoryId: data.categoryId!,
      categoryName: data.categoryName || '',
      description: data.description || '',
      date: data.date ? Timestamp.fromDate(new Date(data.date)) : Timestamp.now(),
      createdAt: Timestamp.now(),
      createdBy: uid
    };

    return from(addDoc(collection(this.firestore, this.COLLECTION), transaction)).pipe(
      map(ref => ref.id)
    );
  }

  updateTransaction(id: string, data: Partial<Transaction>): Observable<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    const updateData: any = { ...data, updatedAt: Timestamp.now() };

    if (data.date) updateData.date = Timestamp.fromDate(new Date(data.date));

    return from(updateDoc(ref, updateData));
  }

  deleteTransaction(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, this.COLLECTION, id)));
  }

  calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }

  sumByType(transactions: Transaction[], type: TransactionType): number {
    return transactions.filter(t => t.type === type).reduce((acc, t) => acc + t.amount, 0);
  }
}