
import React, { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash } from 'lucide-react';

const SupplierForm: React.FC<{
    supplier: Supplier | null;
    onSave: (supplier: Omit<Supplier, 'id' | 'createdAt'> | Supplier) => void;
    onCancel: () => void;
}> = ({ supplier, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        taxId: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        status: 'ativo' as 'ativo' | 'inativo',
        ...supplier
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6">{supplier ? 'Editar' : 'Adicionar'} Fornecedor</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <input name="taxId" value={formData.taxId} onChange={handleChange} placeholder="CNPJ/CPF" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" type="email" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Observações" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        const data = await api.getSuppliers();
        setSuppliers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleSave = async (supplierData: Omit<Supplier, 'id' | 'createdAt'> | Supplier) => {
        if ('id' in supplierData) {
            await api.updateSupplier(supplierData.id, supplierData);
        } else {
            await api.createSupplier(supplierData);
        }
        fetchSuppliers();
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Você tem certeza que deseja excluir este fornecedor?')) {
            await api.deleteSupplier(id);
            fetchSuppliers();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Fornecedores</h1>
                <button onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Adicionar Fornecedor
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
                                <th className="p-4">Contato</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(s => (
                                <tr key={s.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{s.name}</td>
                                    <td className="p-4">{s.email || s.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => { setEditingSupplier(s); setIsModalOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingSupplier(null); }} />}
        </div>
    );
};

export default Suppliers;