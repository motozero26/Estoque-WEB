
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tecnico' | 'admin';
  createdAt: string;
}

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

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
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
  EmAberto = 'Em Aberto',
  EmAndamento = 'Em Andamento',
  Pendente = 'Pendente',
  Resolvido = 'Resolvido',
  Fechado = 'Fechado',
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
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  products: ServiceOrderProduct[];
  services: ServiceOrderService[];
  initialPhotos?: ProductPhoto[];
}

export interface ServiceOrderProduct {
    id: number;
    productId: number;
    productName: string;
    productReference: string;
    qty: number;
    unitCost?: number;
}

export interface ServiceOrderService {
    id: number;
    serviceId: number;
    serviceName: string;
    price: number;
}