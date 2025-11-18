import React, { useEffect, useState } from 'react';
import { HardDrive, Wrench, Users, Package } from 'lucide-react';
import { getDashboardData } from '../services/api';
import { ServiceOrder, ServiceOrderStatus } from '../types';

interface DashboardData {
    totalProducts: number;
    totalSuppliers: number;
    totalClients: number;
    totalServiceOrders: number;
    recentOrders: ServiceOrder[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

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

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getDashboardData();
                setData(res);
            } catch (err) {
                console.error("Falha ao carregar dados do painel.", err);
                setError("Não foi possível carregar os dados do painel. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="text-center p-8">Carregando painel...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!data) return <div className="text-center p-8">Não foi possível carregar os dados.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Painel</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Produtos" value={data.totalProducts} icon={<HardDrive className="text-white" />} color="bg-blue-500" />
                <StatCard title="Total de Fornecedores" value={data.totalSuppliers} icon={<Package className="text-white" />} color="bg-orange-500" />
                <StatCard title="Total de Clientes" value={data.totalClients} icon={<Users className="text-white" />} color="bg-green-500" />
                <StatCard title="Ordens de Serviço" value={data.totalServiceOrders} icon={<Wrench className="text-white" />} color="bg-red-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ordens de Serviço Recentes</h2>
                <div className="space-y-4">
                    {data.recentOrders.length > 0 ? (
                        data.recentOrders.map(order => (
                            <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{order.osNumber || `OS #${order.id}`}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.clientName}</p>
                                    <p className="text-xs text-gray-400 mt-1">Entrada: {new Date(order.entryDate).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma ordem de serviço cadastrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;