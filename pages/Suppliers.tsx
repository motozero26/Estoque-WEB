import React, { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash, AlertTriangle } from 'lucide-react';

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
    const [errors, setErrors] = useState({ taxId: '' });

    const validateCnpj = (cnpj: string): string => {
        if (!cnpj) return ''; // Optional field, no error if empty
        const isValid = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
        return isValid ? '' : 'Formato de CNPJ inválido. Use XX.XXX.XXX/XXXX-XX';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        if (name === 'taxId') {
            const onlyNumbers = value.replace(/[^\d]/g, '');
            value = onlyNumbers
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .slice(0, 18); // Limit to CNPJ length with mask
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cnpjError = validateCnpj(formData.taxId || '');
        if (cnpjError) {
            setErrors({ taxId: cnpjError });
            return;
        }
        setErrors({ taxId: '' });
        onSave(formData);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6">{supplier ? 'Editar' : 'Adicionar'} Fornecedor</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <div>
                            <input name="taxId" value={formData.taxId} onChange={handleChange} placeholder="CNPJ" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
                        </div>
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


const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            alert("Não foi possível carregar os fornecedores.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleSave = async (supplierData: Omit<Supplier, 'id' | 'createdAt'> | Supplier) => {
        try {
            if ('id' in supplierData) {
                const { id, createdAt, ...updateData } = supplierData;
                await api.updateSupplier(id, updateData);
            } else {
                await api.createSupplier(supplierData);
            }
            fetchSuppliers();
            setIsModalOpen(false);
            setEditingSupplier(null);
        } catch (error) {
            console.error("Failed to save supplier:", error);
            alert(`Falha ao salvar fornecedor: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    };

    const handleDelete = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
    };

    const handleConfirmDelete = async () => {
        if (!supplierToDelete) return;
        try {
            await api.deleteSupplier(supplierToDelete.id);
            fetchSuppliers();
        } catch (error) {
            console.error("Failed to delete supplier:", error);
            alert(`Falha ao excluir fornecedor: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setSupplierToDelete(null);
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
                                        <button onClick={() => handleDelete(s)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingSupplier(null); }} />}
            {supplierToDelete && (
                <ConfirmationModal
                    title="Excluir Fornecedor"
                    message={`Você tem certeza que deseja excluir o fornecedor "${supplierToDelete.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setSupplierToDelete(null)}
                />
            )}
        </div>
    );
};

export default Suppliers;
