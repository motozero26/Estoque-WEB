
import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../types';
import * as api from '../services/api';
import { Plus } from 'lucide-react';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Add Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        const data = await api.getClients();
        setClients(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);
    
    const handleSave = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
        await api.createClient(clientData);
        fetchClients();
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clients</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Add Client
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(c => (
                                <tr key={c.id} className="border-b dark:border-gray-700">
                                    <td className="p-4 font-medium">{c.name}</td>
                                    <td className="p-4">{c.email}</td>
                                    <td className="p-4">{c.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <ClientForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Clients;
