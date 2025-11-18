import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash, AlertTriangle } from 'lucide-react';

type UserFormData = (Omit<User, 'id' | 'createdAt'> | User) & { password?: string };

const TechnicianForm: React.FC<{
    user: User | null;
    onSave: (user: UserFormData) => void;
    onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'tecnico' as 'tecnico' | 'admin',
        password: '',
        ...user
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // A senha é obrigatória apenas para novos usuários
        if (!user && !formData.password) {
            alert('A senha é obrigatória para novos usuários.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">{user ? 'Editar' : 'Adicionar'} Técnico</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" type="email" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <div>
                        <input 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder={user ? "Nova senha (deixe em branco para não alterar)" : "Senha"} 
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                            required={!user} // Obrigatório apenas se for um novo usuário
                        />
                    </div>
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


const Technicians: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            alert("Não foi possível carregar os usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleSave = async (userData: UserFormData) => {
        try {
            if ('id' in userData && userData.id) {
                // Destructure to remove properties that shouldn't be updated.
                const { id, createdAt, password, email, ...updateData } = userData;
                await api.updateUser(id, updateData);
            } else {
                // Garante que a senha está presente para novos usuários
                const createData = { ...userData, password: userData.password || '' };
                await api.createUser(createData as Omit<User, 'id' | 'createdAt'> & { password: string });
            }
            fetchUsers();
            closeModal();
        } catch (error) {
            console.error("Failed to save user:", error);
            alert(`Falha ao salvar usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.deleteUser(userToDelete.id);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert(`Falha ao excluir usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setUserToDelete(null); // Close the modal
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const isAdmin = currentUser.role === 'admin';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Técnicos</h1>
                {isAdmin && (
                    <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Plus size={20}/> Adicionar Técnico
                    </button>
                )}
            </div>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">E-mail</th>
                                <th className="p-4">Função</th>
                                {isAdmin && <th className="p-4">Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleEdit(u)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16}/></button>
                                            {u.id !== currentUser.id && (
                                                <button onClick={() => handleDelete(u)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <TechnicianForm user={editingUser} onSave={handleSave} onCancel={closeModal} />}
            {userToDelete && (
                <ConfirmationModal
                    title="Excluir Técnico"
                    message={`Você tem certeza que deseja excluir o técnico "${userToDelete.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setUserToDelete(null)}
                />
            )}
        </div>
    );
};

export default Technicians;
