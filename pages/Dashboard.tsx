
import React, { useEffect, useState } from 'react';
import { HardDrive, Package, AlertTriangle, Wrench } from 'lucide-react';
import { getDashboardData } from '../services/api';
import { ServiceOrder } from '../types';

interface DashboardData {
    totalProducts: number;
    totalSuppliers: number;
    stockAlerts: number;
    pendingOrders: number;
    newOrders: ServiceOrder[];
    activeOrders: ServiceOrder[];
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

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardData().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Carregando painel...</div>;
    if (!data) return <div>Falha ao carregar dados.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Painel</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Produtos" value={data.totalProducts} icon={<HardDrive className="text-white" />} color="bg-blue-500" />
                <StatCard title="Total de Fornecedores" value={data.totalSuppliers} icon={<Package className="text-white" />} color="bg-green-500" />
                <StatCard title="Alertas de Estoque" value={data.stockAlerts} icon={<AlertTriangle className="text-white" />} color="bg-yellow-500" />
                <StatCard title="Ordens em Aberto" value={data.pendingOrders} icon={<Wrench className="text-white" />} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Novas Ordens de Serviço (Em Aberto)</h2>
                    <div className="space-y-4">
                        {data.newOrders.length > 0 ? (
                            data.newOrders.map(order => (
                                <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{order.osNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.clientName}</p>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.entryDate).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma nova ordem de serviço.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ordens em Andamento</h2>
                    <div className="space-y-4">
                        {data.activeOrders.length > 0 ? (
                            data.activeOrders.map(order => (
                                <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{order.osNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.clientName}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">{order.technicianName}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma ordem em andamento.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
