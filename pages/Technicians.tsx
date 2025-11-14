
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/api';
import { Plus } from 'lucide-react';

const TechnicianForm: React.FC<{
    onSave: (user: Omit<User, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        role: 'tecnico' as 'tecnico' | 'admin',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Adicionar Técnico</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="username" value={formData.username} onChange={handleChange} placeholder="Usuário" type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="tecnico">Técnico</option>
                        <option value="admin">Admin</option>
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


const Technicians: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const data = await api.getUsers();
        setUsers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleSave = async (userData: Omit<User, 'id' | 'createdAt'>) => {
        await api.createUser(userData);
        fetchUsers();
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Técnicos</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Adicionar Técnico
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
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Função</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4">{u.username}</td>
                                    <td className="p-4">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <TechnicianForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Technicians;