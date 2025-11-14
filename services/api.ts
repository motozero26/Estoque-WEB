
import { Supplier, Product, Client, ServiceOrder, ServiceOrderStatus } from '../types';

// Mock Data
let suppliers: Supplier[] = [
  { id: 1, name: "Fornecedor ABC", taxId: "12.345.678/0001-90", phone:"11999990000", email:"contato@fornecedorabc.com", address:"Av. Exemplo, 100", status: 'ativo', createdAt: new Date().toISOString() },
  { id: 2, name: "Fornecedor XYZ", taxId: "98.765.432/0001-11", phone:"11988880000", email:"vendas@fornecedorxyz.com", address:"Rua Outra, 200", status: 'ativo', createdAt: new Date().toISOString() }
];

let products: Product[] = [
    { id: 1, reference: 'SSD-512-INT', name: 'SSD 512GB', supplierId: 1, supplierName: 'Fornecedor ABC', status: 'usado', qty: 5, dateEntry: new Date().toISOString(), photos: [{url: 'https://picsum.photos/id/1/200/200', name: 'ssd1.jpg'}], isUsable: true, cost: 50.0, createdAt: new Date().toISOString() },
    { id: 2, reference: 'MB-USADA-H110', name: 'Placa-mãe H110 (usada)', supplierId: 1, supplierName: 'Fornecedor ABC', status: 'usado', isUsable: true, cost: 0, qty: 1, location: 'Bancada A', dateEntry: new Date().toISOString(), photos: [{url: 'https://picsum.photos/id/2/200/200', name: 'mb1.jpg'}], createdAt: new Date().toISOString() },
    { id: 3, reference: 'RAM-8GB-DDR4', name: 'Memória RAM 8GB DDR4', supplierId: 2, supplierName: 'Fornecedor XYZ', status: 'novo', qty: 10, minQty: 2, dateEntry: new Date().toISOString(), photos: [{url: 'https://picsum.photos/id/3/200/200', name: 'ram1.jpg'}], isUsable: true, cost: 35.0, createdAt: new Date().toISOString() },
];

let clients: Client[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', createdAt: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', createdAt: new Date().toISOString() }
];

let serviceOrders: ServiceOrder[] = [
    { id: 1, osNumber: 'OS-2024-001', clientId: 1, clientName: 'John Doe', status: ServiceOrderStatus.InProgress, entryDate: new Date().toISOString(), createdAt: new Date().toISOString(), products: [{id: 1, productId: 1, productName: 'SSD 512GB', productReference: 'SSD-512-INT', qty: 1, unitCost: 50}] },
    { id: 2, osNumber: 'OS-2024-002', clientId: 2, clientName: 'Jane Smith', status: ServiceOrderStatus.Pending, entryDate: new Date().toISOString(), createdAt: new Date().toISOString(), products: [] }
];

const mockApi = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 500));

// --- Suppliers API ---
export const getSuppliers = () => mockApi(suppliers);
export const getSupplier = (id: number) => mockApi(suppliers.find(s => s.id === id));
export const createSupplier = (data: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    suppliers.push(newSupplier);
    return mockApi(newSupplier);
};
export const updateSupplier = (id: number, data: Partial<Supplier>) => {
    suppliers = suppliers.map(s => s.id === id ? { ...s, ...data } : s);
    return mockApi(suppliers.find(s => s.id === id));
};
export const deleteSupplier = (id: number) => {
    suppliers = suppliers.filter(s => s.id !== id);
    return mockApi({ success: true });
};

// --- Products API ---
export const getProducts = () => mockApi(products);
export const getProduct = (id: number) => mockApi(products.find(p => p.id === id));
export const createProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    products.push(newProduct);
    return mockApi(newProduct);
};
export const updateProduct = (id: number, data: Partial<Product>) => {
    products = products.map(p => p.id === id ? { ...p, ...data } : p);
    return mockApi(products.find(p => p.id === id));
};
export const deleteProduct = (id: number) => {
    products = products.filter(p => p.id !== id);
    return mockApi({ success: true });
};

// --- Clients API ---
export const getClients = () => mockApi(clients);
export const createClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    clients.push(newClient);
    return mockApi(newClient);
};

// --- Service Orders API ---
export const getServiceOrders = () => mockApi(serviceOrders);
export const createServiceOrder = (data: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products'>) => {
    const client = clients.find(c => c.id === data.clientId);
    const newSO: ServiceOrder = { 
        ...data, 
        id: Date.now(), 
        osNumber: `OS-${new Date().getFullYear()}-${String(serviceOrders.length + 1).padStart(3, '0')}`,
        clientName: client?.name || 'Unknown',
        products: [],
        createdAt: new Date().toISOString() 
    };
    serviceOrders.push(newSO);
    return mockApi(newSO);
};
export const addProductToServiceOrder = (orderId: number, productId: number, qty: number) => {
    const order = serviceOrders.find(so => so.id === orderId);
    const product = products.find(p => p.id === productId);
    if(order && product) {
        // In a real app, this would reserve stock, not reduce it
        product.qty -= qty;
        order.products.push({
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            productReference: product.reference,
            qty: qty,
            unitCost: product.cost
        });
        return mockApi(order);
    }
    return Promise.reject("Order or Product not found");
}

// --- Reports API ---
export const getDashboardData = () => {
    const stockAlerts = products.filter(p => p.minQty && p.qty < p.minQty).length;
    const pendingOrders = serviceOrders.filter(so => so.status === ServiceOrderStatus.Pending).length;
    
    const supplierStockValue = suppliers.map(supplier => {
        const totalValue = products
            .filter(p => p.supplierId === supplier.id && p.cost)
            .reduce((acc, p) => acc + (p.cost! * p.qty), 0);
        return { name: supplier.name, value: totalValue };
    }).sort((a,b) => b.value - a.value);

    return mockApi({
        totalProducts: products.length,
        totalSuppliers: suppliers.length,
        stockAlerts,
        pendingOrders,
        supplierStockValue
    });
}
