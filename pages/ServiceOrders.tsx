
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ServiceOrder, Client, Product, ServiceOrderStatus, User, ProductPhoto, Service } from '../types';
import * as api from '../services/api';
import { Plus, PackagePlus, ArrowRight, X, UploadCloud, Printer, ArrowUp, ArrowDown, Briefcase } from 'lucide-react';

type CreateServiceOrderData = Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products' | 'services' | 'status'>;

type SortableKey = 'osNumber' | 'clientName' | 'status' | 'technicianName';

const ServiceOrderForm: React.FC<{
    clients: Client[];
    onSave: (order: CreateServiceOrderData) => void;
    onCancel: () => void;
}> = ({ clients, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        clientId: 0,
        entryDate: new Date().toISOString().split('T')[0],
        diagnosisInitial: '',
        initialPhotos: [] as ProductPhoto[],
    });
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPhotos: ProductPhoto[] = files.map((file: File) => ({ url: URL.createObjectURL(file), name: file.name }));
            const newPreviews = newPhotos.map(p => p.url);

            setFormData(prev => ({ ...prev, initialPhotos: [...(prev.initialPhotos || []), ...newPhotos] }));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Nova Ordem de Serviço</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                        <option value={0} disabled>Selecione um Cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="diagnosisInitial" value={formData.diagnosisInitial} onChange={handleChange} placeholder="Diagnóstico Inicial" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium">Fotos Iniciais do Equipamento</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Arraste e solte as fotos aqui, ou clique para selecionar</p>
                            <input type="file" multiple onChange={handlePhotoChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                        </div>
                        <div className="mt-4 flex gap-4 flex-wrap">
                            {photoPreviews.map((src, index) => (
                                <img key={index} src={src} alt="preview" className="w-24 h-24 object-cover rounded"/>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Criar OS</button>
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

const AddServiceToOrderForm: React.FC<{
    orderId: number;
    services: Service[];
    onSave: (orderId: number, serviceId: number) => void;
    onCancel: () => void;
}> = ({ orderId, services, onSave, onCancel }) => {
    const [serviceId, setServiceId] = useState<number | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (serviceId) {
            onSave(orderId, serviceId);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Adicionar Serviço à OS</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option>Selecione o serviço</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}</option>)}
                    </select>
                     <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Adicionar Serviço</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const PrintableOS: React.FC<{ order: ServiceOrder; client: Client | undefined; onClose: () => void; }> = ({ order, client, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printSection = printContent.innerHTML;
            document.body.innerHTML = printSection;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Recarrega para restaurar os scripts e o estado
        }
    };

    const totalProducts = order.products.reduce((acc, curr) => acc + ((curr.unitCost || 0) * curr.qty), 0);
    const totalServices = order.services ? order.services.reduce((acc, curr) => acc + curr.price, 0) : 0;
    const totalGeneral = totalProducts + totalServices;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-0 w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Imprimir Ordem de Serviço</h2>
                    <div>
                        <button onClick={handlePrint} className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"><Printer size={16}/> Imprimir</button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><X size={24} /></button>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto">
                    <div ref={printRef} className="printable-content text-black">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold">Ordem de Serviço</h1>
                            <p className="text-xl font-semibold">{order.osNumber}</p>
                        </div>
                        <div className="border-t border-b border-gray-300 py-4 my-4">
                            <h2 className="text-lg font-bold mb-2">Detalhes do Cliente</h2>
                            <p><strong>Nome:</strong> {order.clientName}</p>
                            <p><strong>Telefone:</strong> {client?.phone || 'N/A'}</p>
                            <p><strong>Email:</strong> {client?.email || 'N/A'}</p>
                        </div>
                         <div className="py-4 my-4">
                            <h2 className="text-lg font-bold mb-2">Informações do Serviço</h2>
                            <p><strong>Data de Entrada:</strong> {new Date(order.entryDate).toLocaleDateString()}</p>
                            <p><strong>Diagnóstico/Problema Inicial:</strong></p>
                            <p className="whitespace-pre-wrap pl-2 border-l-2 border-gray-200">{order.diagnosisInitial || 'Nenhuma descrição fornecida.'}</p>
                        </div>
                        
                        {(order.services && order.services.length > 0) && (
                             <div className="py-4 my-4">
                                <h2 className="text-lg font-bold mb-2">Serviços (Mão de Obra)</h2>
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left">Serviço</th>
                                            <th className="border border-gray-300 p-2 text-right">Preço</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.services.map(s => (
                                            <tr key={s.id}>
                                                <td className="border border-gray-300 p-2">{s.serviceName}</td>
                                                <td className="border border-gray-300 p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {(order.products && order.products.length > 0) && (
                             <div className="py-4 my-4">
                                <h2 className="text-lg font-bold mb-2">Peças / Produtos</h2>
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left">Produto</th>
                                            <th className="border border-gray-300 p-2 text-center">Qtd</th>
                                            <th className="border border-gray-300 p-2 text-right">Unit.</th>
                                            <th className="border border-gray-300 p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products.map(p => (
                                            <tr key={p.id}>
                                                <td className="border border-gray-300 p-2">{p.productName}</td>
                                                <td className="border border-gray-300 p-2 text-center">{p.qty}</td>
                                                <td className="border border-gray-300 p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.unitCost || 0)}</td>
                                                <td className="border border-gray-300 p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((p.unitCost || 0) * p.qty)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        <div className="py-4 my-4 text-right">
                            <h3 className="text-xl font-bold">Total Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeneral)}</h3>
                        </div>

                        {order.initialPhotos && order.initialPhotos.length > 0 && (
                             <div className="py-4 my-4">
                                <h2 className="text-lg font-bold mb-2">Fotos do Equipamento</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {order.initialPhotos.map((photo, index) => (
                                        <img key={index} src={photo.url} alt={photo.name} className="w-full h-auto object-cover rounded shadow-md border" />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-16 pt-8 border-t border-gray-300">
                            <p className="text-xs text-gray-600 text-center mb-12">
                                Termos e condições: A assinatura abaixo confirma que o cliente está ciente do diagnóstico inicial e autoriza o serviço. O valor final pode variar após análise técnica completa.
                            </p>
                            <div className="flex justify-around items-center">
                                <div className="text-center">
                                    <div className="border-t-2 border-black w-64 mt-2"></div>
                                    <p className="mt-2 font-semibold">Assinatura do Técnico</p>
                                </div>
                                <div className="text-center">
                                     <div className="border-t-2 border-black w-64 mt-2"></div>
                                    <p className="mt-2 font-semibold">Assinatura do Cliente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServiceOrderDetailModal: React.FC<{
    order: ServiceOrder;
    allProducts: Product[];
    onClose: () => void;
}> = ({ order, allProducts, onClose }) => {
    
    const productsWithPhotos = order.products.map(op => {
        const productDetails = allProducts.find(p => p.id === op.productId);
        return {
            ...op,
            photos: productDetails?.photos || []
        };
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Detalhes da OS: {order.osNumber}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Cliente</h3>
                        <p className="text-gray-600 dark:text-gray-400">{order.clientName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Data de Entrada</h3>
                        <p className="text-gray-600 dark:text-gray-400">{new Date(order.entryDate).toLocaleDateString()}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Diagnóstico Inicial</h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{order.diagnosisInitial || 'Nenhuma descrição fornecida.'}</p>
                    </div>
                     {order.initialPhotos && order.initialPhotos.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Fotos Iniciais</h3>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {order.initialPhotos.map((photo, index) => (
                                    <img key={index} src={photo.url} alt={photo.name} className="w-24 h-24 object-cover rounded shadow-md" />
                                ))}
                            </div>
                        </div>
                     )}
                    
                    {(order.services && order.services.length > 0) && (
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Serviços</h3>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                                {order.services.map(s => (
                                    <li key={s.id}>{s.serviceName} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Produtos Associados</h3>
                        {productsWithPhotos.length > 0 ? (
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {productsWithPhotos.map(p => (
                                    <div key={p.id}>
                                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300">{p.productName} (x{p.qty})</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {p.photos.length > 0 ? p.photos.map((photo, index) => (
                                                <img key={index} src={photo.url} alt={photo.name} className="w-20 h-20 object-cover rounded shadow-md" />
                                            )) : <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">Sem Foto</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Nenhum produto associado a esta OS.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const ServiceOrders: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
    const [isAddServiceFormOpen, setIsAddServiceFormOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [viewingOrder, setViewingOrder] = useState<ServiceOrder | null>(null);
    const [orderToPrint, setOrderToPrint] = useState<ServiceOrder | null>(null);

    const [sortConfig, setSortConfig] = useState<{ table: 'inProgress' | 'myOrders'; key: SortableKey; direction: 'ascending' | 'descending' } | null>(null);

    const isAdmin = currentUser.role === 'admin';

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [ordersData, clientsData, productsData, servicesData] = await Promise.all([
            api.getServiceOrders(), 
            api.getClients(), 
            api.getProducts(),
            api.getServices()
        ]);
        setOrders(ordersData);
        setClients(clientsData);
        setProducts(productsData);
        setServices(servicesData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateOrder = async (orderData: CreateServiceOrderData) => {
        const newOrder = await api.createServiceOrder(orderData);
        fetchData();
        setIsFormOpen(false);
        setOrderToPrint(newOrder); // Abre a tela de impressão após criar
    };

    const handleAddProduct = async (orderId: number, productId: number, qty: number) => {
        await api.addProductToServiceOrder(orderId, productId, qty);
        fetchData();
        setIsAddProductFormOpen(false);
        setSelectedOrderId(null);
    }
    
    const handleAddService = async (orderId: number, serviceId: number) => {
        await api.addServiceToServiceOrder(orderId, serviceId);
        fetchData();
        setIsAddServiceFormOpen(false);
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
    
    const { newOrders, inProgressOrders, myOrders } = useMemo(() => {
        const newOrders = orders
            .filter(o => o.status === ServiceOrderStatus.EmAberto)
            .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
        const inProgressOrders = orders.filter(o => o.status !== ServiceOrderStatus.EmAberto);
        const myOrders = orders.filter(o => o.technicianId === currentUser.id);
        return { newOrders, inProgressOrders, myOrders };
    }, [orders, currentUser.id]);

    const sortedOrders = useMemo(() => {
        let sortableInProgress = [...inProgressOrders];
        let sortableMyOrders = [...myOrders];

        if (sortConfig) {
            const sortableArray = sortConfig.table === 'inProgress' ? sortableInProgress : sortableMyOrders;
            
            sortableArray.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });

            if (sortConfig.table === 'inProgress') {
                sortableInProgress = sortableArray;
            } else {
                sortableMyOrders = sortableArray;
            }
        }

        return { sortedInProgress: sortableInProgress, sortedMyOrders: sortableMyOrders };
    }, [inProgressOrders, myOrders, sortConfig]);

    const requestSort = (table: 'inProgress' | 'myOrders', key: SortableKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.table === table && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ table, key, direction });
    };

    const getSortIcon = (table: 'inProgress' | 'myOrders', key: SortableKey) => {
        if (sortConfig?.table !== table || sortConfig?.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-1" size={16} /> : <ArrowDown className="ml-1" size={16} />;
    };


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
                <div className="space-y-8">
                    {/* Novas OS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Novas OS (Fila)</h2>
                        <div className="space-y-4">
                            {newOrders.length > 0 ? newOrders.map((o, index) => (
                                <div key={o.id} onClick={() => setViewingOrder(o)} className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${index === 0 ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">{o.osNumber}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{o.clientName}</p>
                                            <p className="text-xs text-gray-400 mt-1">Entrada: {new Date(o.entryDate).toLocaleDateString()}</p>
                                        </div>
                                        {index === 0 && (
                                            <button onClick={(e) => { e.stopPropagation(); handleTakeOrder(o.id); }} className="bg-green-500 text-white px-3 py-1 text-sm rounded-lg flex items-center gap-2 hover:bg-green-600">
                                                Pegar OS <ArrowRight size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400">Nenhuma nova OS na fila.</p>}
                        </div>
                    </div>

                    {/* OS em execução */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">OS em execução</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('inProgress', 'osNumber')}>
                                            <div className="flex items-center">Nº da OS {getSortIcon('inProgress', 'osNumber')}</div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('inProgress', 'clientName')}>
                                            <div className="flex items-center">Cliente {getSortIcon('inProgress', 'clientName')}</div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('inProgress', 'status')}>
                                            <div className="flex items-center">Status {getSortIcon('inProgress', 'status')}</div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('inProgress', 'technicianName')}>
                                            <div className="flex items-center">Técnico {getSortIcon('inProgress', 'technicianName')}</div>
                                        </th>
                                        {isAdmin && <th className="p-4">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedOrders.sortedInProgress.map(o => (
                                        <tr key={o.id} className="border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setViewingOrder(o)}>
                                            <td className="p-4 font-medium">{o.osNumber}</td>
                                            <td className="p-4">{o.clientName}</td>
                                            <td className="p-4" onClick={e => { if (isAdmin) e.stopPropagation(); }}>
                                                {isAdmin ? (
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
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(o.status)}`}>
                                                        {o.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">{o.technicianName}</td>
                                            {isAdmin && (
                                                <td className="p-4 flex gap-1" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => { setSelectedOrderId(o.id); setIsAddProductFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Adicionar Produto">
                                                        <PackagePlus size={16}/>
                                                    </button>
                                                    <button onClick={() => { setSelectedOrderId(o.id); setIsAddServiceFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Adicionar Serviço">
                                                        <Briefcase size={16}/>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {sortedOrders.sortedInProgress.length === 0 && (
                                        <tr>
                                            <td colSpan={isAdmin ? 5 : 4} className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhuma OS em execução no momento.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Minhas OS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Minhas OS</h2>
                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('myOrders', 'osNumber')}>
                                            <div className="flex items-center">Nº da OS {getSortIcon('myOrders', 'osNumber')}</div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('myOrders', 'clientName')}>
                                            <div className="flex items-center">Cliente {getSortIcon('myOrders', 'clientName')}</div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('myOrders', 'status')}>
                                            <div className="flex items-center">Status {getSortIcon('myOrders', 'status')}</div>
                                        </th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedOrders.sortedMyOrders.map(o => (
                                        <tr key={o.id} className="border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setViewingOrder(o)}>
                                            <td className="p-4 font-medium">{o.osNumber}</td>
                                            <td className="p-4">{o.clientName}</td>
                                            <td className="p-4" onClick={e => e.stopPropagation()}>
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
                                            <td className="p-4 flex gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => { setSelectedOrderId(o.id); setIsAddProductFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Adicionar Produto">
                                                    <PackagePlus size={16}/>
                                                </button>
                                                <button onClick={() => { setSelectedOrderId(o.id); setIsAddServiceFormOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" title="Adicionar Serviço">
                                                    <Briefcase size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedOrders.sortedMyOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">Você não possui nenhuma OS atribuída.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {isFormOpen && <ServiceOrderForm clients={clients} onSave={handleCreateOrder} onCancel={() => setIsFormOpen(false)} />}
            {isAddProductFormOpen && selectedOrderId && <AddProductToOrderForm orderId={selectedOrderId} products={products} onSave={handleAddProduct} onCancel={() => setIsAddProductFormOpen(false)} />}
            {isAddServiceFormOpen && selectedOrderId && <AddServiceToOrderForm orderId={selectedOrderId} services={services} onSave={handleAddService} onCancel={() => setIsAddServiceFormOpen(false)} />}
            {viewingOrder && <ServiceOrderDetailModal order={viewingOrder} allProducts={products} onClose={() => setViewingOrder(null)} />}
            {orderToPrint && <PrintableOS order={orderToPrint} client={clients.find(c => c.id === orderToPrint.clientId)} onClose={() => setOrderToPrint(null)} />}
        </div>
    );
};

export default ServiceOrders;