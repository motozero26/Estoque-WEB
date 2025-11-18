import React, { useState, useEffect, useCallback } from 'react';
import { Client, ServiceOrder } from '../types';
import * as api from '../services/api';
import { Plus, X } from 'lucide-react';

const ClientForm: React.FC<{
    onSave: (client: Omit<Client, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        cpfCnpj: '',
        phone: '',
        email: '',
        address: ''
    });
    const [errors, setErrors] = useState({ email: '', phone: '' });

    const validate = (): boolean => {
        const tempErrors = { email: '', phone: '' };
        
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Formato de e-mail inválido.';
        }

        const phoneDigits = (formData.phone || '').replace(/\D/g, '');
        if (formData.phone && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
            tempErrors.phone = 'O telefone deve ter 10 ou 11 dígitos.';
        }

        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            const onlyNumbers = value.replace(/[^\d]/g, '');
            if (onlyNumbers.length <= 10) {
                 value = onlyNumbers
                    .replace(/(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{4})(\d)/, '$1-$2')
                    .slice(0, 14); // (XX) XXXX-XXXX
            } else {
                 value = onlyNumbers
                    .replace(/(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2')
                    .slice(0, 15); // (XX) XXXXX-XXXX
            }
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Adicionar Cliente</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} placeholder="CPF/CNPJ" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div>
                        <input name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" type="email" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientDetailModal: React.FC<{
    client: Client;
    orders: ServiceOrder[];
    onClose: () => void;
}> = ({ client, orders, onClose }) => {
    const clientOrders = orders.filter(o => o.clientId === client.id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{client.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">CPF/CNPJ</h3>
                        <p className="text-gray-600 dark:text-gray-400">{client.cpfCnpj || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">E-mail</h3>
                        <p className="text-gray-600 dark:text-gray-400">{client.email || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Telefone</h3>
                        <p className="text-gray-600 dark:text-gray-400">{client.phone || 'N/A'}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Endereço</h3>
                        <p className="text-gray-600 dark:text-gray-400">{client.address || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Histórico de Ordens de Serviço</h3>
                    <div className="space-y-3">
                        {clientOrders.length > 0 ? (
                            clientOrders.map(order => (
                                <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{order.osNumber}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Data: {new Date(order.entryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma ordem de serviço encontrada para este cliente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [clientsData, ordersData] = await Promise.all([
            api.getClients(),
            api.getServiceOrders()
        ]);
        setClients(clientsData);
        setServiceOrders(ordersData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSave = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
        await api.createClient(clientData);
        fetchData();
        setIsFormOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <button onClick={() => setIsFormOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Adicionar Cliente
                </button>
            </div>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">CPF/CNPJ</th>
                                <th className="p-4">E-mail</th>
                                <th className="p-4">Telefone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(c => (
                                <tr key={c.id} className="border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setViewingClient(c)}>
                                    <td className="p-4 font-medium">{c.name}</td>
                                    <td className="p-4">{c.cpfCnpj}</td>
                                    <td className="p-4">{c.email}</td>
                                    <td className="p-4">{c.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isFormOpen && <ClientForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
            {viewingClient && <ClientDetailModal client={viewingClient} orders={serviceOrders} onClose={() => setViewingClient(null)} />}
        </div>
    );
};

export default Clients;