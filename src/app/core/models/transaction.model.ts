export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  businessId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName?: string;     // denormalizado para mostrar fácil
  description?: string;
  date: Date | any;          // fecha del movimiento
  createdAt: Date | any;
  updatedAt?: Date | any;
  createdBy: string;         // uid del usuario
}
