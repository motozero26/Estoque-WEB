
export interface Supplier {
  id: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface ProductPhoto {
    url: string;
    name: string;
}

export interface Product {
  id: number;
  reference: string;
  name: string;
  description?: string;
  supplierId?: number;
  supplierName?: string;
  status: 'novo' | 'usado';
  isUsable: boolean;
  cost?: number;
  qty: number;
  minQty?: number;
  location?: string;
  photos: ProductPhoto[];
  dateEntry: string;
  tags?: string[];
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  cpfCnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export enum ServiceOrderStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Canceled = 'Canceled',
}

export interface ServiceOrder {
  id: number;
  osNumber: string;
  clientId: number;
  clientName: string;
  status: ServiceOrderStatus;
  entryDate: string;
  deliveryDate?: string;
  warrantyDays?: number;
  warrantyExpiresAt?: string;
  diagnosisInitial?: string;
  totalEstimated?: number;
  totalFinal?: number;
  responsibleUserId?: number;
  createdAt: string;
  products: ServiceOrderProduct[];
}

export interface ServiceOrderProduct {
    id: number;
    productId: number;
    productName: string;
    productReference: string;
    qty: number;
    unitCost?: number;
}
