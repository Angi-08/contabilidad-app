export interface Business {
  id?: string;
  name: string;
  description?: string;
  currency: string;          // ej: 'MXN', 'USD', 'EUR'
  ownerId: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
  isActive?: boolean;
}
