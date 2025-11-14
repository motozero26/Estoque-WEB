
import React, { useState, useEffect, useCallback } from 'react';
import { ServiceOrder, Client, Product, ServiceOrderStatus } from '../types';
import * as api from '../services/api';
import { Plus, PackagePlus } from 'lucide-react';

const ServiceOrderForm: React.FC<{
    clients: Client[];
    onSave: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products'>) => void;
    onCancel: () => void;
}> = ({ clients, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        clientId: 0,
        status: ServiceOrderStatus.Pending,
        entryDate: new Date().toISOString().split('T')[0],
        diagnosisInitial: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, clientId: Number(formData.clientId) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">New Service Order</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                        <option value={0} disabled>Select a Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="diagnosisInitial" value={formData.diagnosisInitial} onChange={handleChange} placeholder="Initial Diagnosis" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddProductToOrderForm: React.FC<{
    orderId: number;
    products: Product[];
    onSave: (orderId: number, productId: number, qty: number) => void;
    onCancel: () => void;
}> = ({ orderId, products, onSave, onCancel }) => {
    const [productId, setProductId] = useState<number | undefined>();
    const [qty, setQty] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (productId) {
            onSave(orderId, productId, qty);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Add Product to OS</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={productId} onChange={(e) => setProductId(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option>Select product</option>
                        {products.filter(p => p.qty > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({p.qty} in stock)</option>)}
                    </select>
                    <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} min="1" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Add Product</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const ServiceOrders: React.FC = () => {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [ordersData, clientsData, productsData] = await Promise.all([api.getServiceOrders(), api.getClients(), api.getProducts()]);
        setOrders(ordersData);
        setClients(clientsData);
        setProducts(productsData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateOrder = async (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products'>) => {
        await api.createServiceOrder(orderData);
        fetchData();
        setIsFormOpen(false);
    };

    const handleAddProduct = async (orderId: number, productId: number, qty: number) => {
        await api.addProductToServiceOrder(orderId, productId, qty);
        fetchData();
        setIsAddProductFormOpen(false);
        setSelectedOrderId(null);
    }

    const getStatusColor = (status: ServiceOrderStatus) => {
        switch(status) {
            case ServiceOrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
            case ServiceOrderStatus.InProgress: return 'bg-blue-100 text-blue-800';
            case ServiceOrderStatus.Completed: return 'bg-green-100 text-green-800';
            case ServiceOrderStatus.Canceled: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Service Orders</h1>
                <button onClick={() => setIsFormOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> New Service Order
                </button>
            </div>
            {loading ? <p>Loading...</p> : (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">OS Number</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Entry Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{o.osNumber}</td>
                                    <td className="p-4">{o.clientName}</td>
                                    <td className="p-4">{new Date(o.entryDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(o.status)}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => { setSelectedOrderId(o.id); setIsAddProductFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Add Product">
                                            <PackagePlus size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isFormOpen && <ServiceOrderForm clients={clients} onSave={handleCreateOrder} onCancel={() => setIsFormOpen(false)} />}
            {isAddProductFormOpen && selectedOrderId && <AddProductToOrderForm orderId={selectedOrderId} products={products} onSave={handleAddProduct} onCancel={() => setIsAddProductFormOpen(false)} />}
        </div>
    );
};

export default ServiceOrders;
