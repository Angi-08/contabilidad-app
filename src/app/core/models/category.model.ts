export type CategoryType = 'income' | 'expense';

export interface Category {
  id?: string;
  businessId: string;
  name: string;
  type: CategoryType;        // 'income' o 'expense'
  color?: string;            // color opcional para UI
  icon?: string;             // nombre de ionicon
  createdAt: Date | any;
}
