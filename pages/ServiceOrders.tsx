
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ServiceOrder, Client, Product, ServiceOrderStatus, User } from '../types';
import * as api from '../services/api';
import { Plus, PackagePlus, ArrowRight } from 'lucide-react';

const ServiceOrderForm: React.FC<{
    clients: Client[];
    onSave: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products' | 'status'>) => void;
    onCancel: () => void;
}> = ({ clients, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        clientId: 0,
        entryDate: new Date().toISOString().split('T')[0],
        diagnosisInitial: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.clientId === 0) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        onSave({ ...formData, clientId: Number(formData.clientId) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Nova Ordem de Serviço</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                        <option value={0} disabled>Selecione um Cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="diagnosisInitial" value={formData.diagnosisInitial} onChange={handleChange} placeholder="Diagnóstico Inicial" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Criar</button>
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
                <h2 className="text-2xl font-bold mb-6">Adicionar Produto à OS</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={productId} onChange={(e) => setProductId(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option>Selecione o produto</option>
                        {products.filter(p => p.qty > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({p.qty} em estoque)</option>)}
                    </select>
                    <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} min="1" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Adicionar Produto</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const ServiceOrders: React.FC<{ currentUser: User }> = ({ currentUser }) => {
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

    const handleCreateOrder = async (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products' | 'status'>) => {
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
    
    const handleTakeOrder = async (orderId: number) => {
        await api.assignServiceOrder(orderId, currentUser.id);
        fetchData();
    }
    
    const handleStatusChange = async (orderId: number, status: ServiceOrderStatus) => {
        await api.updateServiceOrderStatus(orderId, status);
        fetchData();
    }
    
    const { newOrders, myOrders } = useMemo(() => {
        const newOrders = orders
            .filter(o => o.status === ServiceOrderStatus.EmAberto)
            .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
        const myOrders = orders.filter(o => o.technicianId === currentUser.id);
        return { newOrders, myOrders };
    }, [orders, currentUser.id]);

    const getStatusColor = (status: ServiceOrderStatus) => {
        switch(status) {
            case ServiceOrderStatus.EmAberto: return 'bg-gray-200 text-gray-800';
            case ServiceOrderStatus.Pendente: return 'bg-yellow-100 text-yellow-800';
            case ServiceOrderStatus.EmAndamento: return 'bg-blue-100 text-blue-800';
            case ServiceOrderStatus.Resolvido: return 'bg-purple-100 text-purple-800';
            case ServiceOrderStatus.Fechado: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
                <button onClick={() => setIsFormOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Nova Ordem de Serviço
                </button>
            </div>
            {loading ? <p>Carregando...</p> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Novas OS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Novas OS (Fila)</h2>
                        <div className="space-y-4">
                            {newOrders.length > 0 ? newOrders.map((o, index) => (
                                <div key={o.id} className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${index === 0 ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">{o.osNumber}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{o.clientName}</p>
                                            <p className="text-xs text-gray-400 mt-1">Entrada: {new Date(o.entryDate).toLocaleDateString()}</p>
                                        </div>
                                        {index === 0 && (
                                            <button onClick={() => handleTakeOrder(o.id)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-lg flex items-center gap-2 hover:bg-green-600">
                                                Pegar OS <ArrowRight size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : <p>Nenhuma nova OS na fila.</p>}
                        </div>
                    </div>
                    {/* Minhas OS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Minhas OS em Execução</h2>
                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4">Nº da OS</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOrders.map(o => (
                                        <tr key={o.id} className="border-b dark:border-gray-700">
                                            <td className="p-4 font-medium">{o.osNumber}</td>
                                            <td className="p-4">{o.clientName}</td>
                                            <td className="p-4">
                                                <select 
                                                    value={o.status} 
                                                    onChange={(e) => handleStatusChange(o.id, e.target.value as ServiceOrderStatus)}
                                                    className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-0 ${getStatusColor(o.status)}`}
                                                >
                                                    <option value={ServiceOrderStatus.EmAndamento}>Em Andamento</option>
                                                    <option value={ServiceOrderStatus.Pendente}>Pendente</option>
                                                    <option value={ServiceOrderStatus.Resolvido}>Resolvido</option>
                                                    <option value={ServiceOrderStatus.Fechado}>Fechado</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => { setSelectedOrderId(o.id); setIsAddProductFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Adicionar Produto">
                                                    <PackagePlus size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {isFormOpen && <ServiceOrderForm clients={clients} onSave={handleCreateOrder} onCancel={() => setIsFormOpen(false)} />}
            {isAddProductFormOpen && selectedOrderId && <AddProductToOrderForm orderId={selectedOrderId} products={products} onSave={handleAddProduct} onCancel={() => setIsAddProductFormOpen(false)} />}
        </div>
    );
};

export default ServiceOrders;
