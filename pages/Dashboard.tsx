
import React, { useEffect, useState } from 'react';
import { HardDrive, Package, AlertTriangle, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardData } from '../services/api';

interface DashboardData {
    totalProducts: number;
    totalSuppliers: number;
    stockAlerts: number;
    pendingOrders: number;
    supplierStockValue: { name: string; value: number }[];
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

    if (loading) return <div>Loading dashboard...</div>;
    if (!data) return <div>Failed to load data.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Products" value={data.totalProducts} icon={<HardDrive className="text-white" />} color="bg-blue-500" />
                <StatCard title="Total Suppliers" value={data.totalSuppliers} icon={<Package className="text-white" />} color="bg-green-500" />
                <StatCard title="Stock Alerts" value={data.stockAlerts} icon={<AlertTriangle className="text-white" />} color="bg-yellow-500" />
                <StatCard title="Pending Orders" value={data.pendingOrders} icon={<Wrench className="text-white" />} color="bg-red-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Stock Value by Supplier</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.supplierStockValue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} labelStyle={{ color: '#fff' }}/>
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Stock Value ($)"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
