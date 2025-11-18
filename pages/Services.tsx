
import React, { useState, useEffect, useCallback } from 'react';
import { Service } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash, AlertTriangle } from 'lucide-react';

const ServiceForm: React.FC<{
    service: Service | null;
    onSave: (service: Omit<Service, 'id' | 'createdAt'> | Service) => void;
    onCancel: () => void;
}> = ({ service, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        ...service
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">{service ? 'Editar' : 'Adicionar'} Serviço</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome do Serviço" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Descrição" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div>
                        <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
            alert("Não foi possível carregar os serviços.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleSave = async (serviceData: Omit<Service, 'id' | 'createdAt'> | Service) => {
        try {
            if ('id' in serviceData) {
                const { id, createdAt, ...updateData } = serviceData;
                await api.updateService(id, updateData);
            } else {
                await api.createService(serviceData);
            }
            fetchServices();
            setIsModalOpen(false);
            setEditingService(null);
        } catch (error) {
            console.error("Failed to save service:", error);
            alert(`Falha ao salvar serviço: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    };

    const handleDelete = (service: Service) => {
        setServiceToDelete(service);
    };

    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;
        try {
            await api.deleteService(serviceToDelete.id);
            fetchServices();
        } catch (error) {
            console.error("Failed to delete service:", error);
            alert(`Falha ao excluir serviço: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setServiceToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Serviços</h1>
                <button onClick={() => { setEditingService(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Adicionar Serviço
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
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Preço</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(s => (
                                <tr key={s.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{s.name}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{s.description}</td>
                                    <td className="p-4 font-semibold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => { setEditingService(s); setIsModalOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(s)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                             {services.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum serviço cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <ServiceForm service={editingService} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingService(null); }} />}
            {serviceToDelete && (
                <ConfirmationModal
                    title="Excluir Serviço"
                    message={`Você tem certeza que deseja excluir o serviço "${serviceToDelete.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setServiceToDelete(null)}
                />
            )}
        </div>
    );
};

export default Services;
