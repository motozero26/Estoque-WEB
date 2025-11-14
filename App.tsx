
import React from 'react';
import { HashRouter, Routes, Route, Outlet, NavLink } from 'react-router-dom';
import { BarChart, Users, HardDrive, Wrench, Package, Home, FileText } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Clients from './pages/Clients';
import ServiceOrders from './pages/ServiceOrders';
import Reports from './pages/Reports';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/suppliers', label: 'Suppliers', icon: Package },
  { path: '/products', label: 'Products', icon: HardDrive },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/service-orders', label: 'Service Orders', icon: Wrench },
  { path: '/reports', label: 'Reports', icon: FileText },
];

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col p-4 border-r border-gray-200 dark:border-gray-700">
    <div className="text-2xl font-bold mb-8 flex items-center gap-2">
      <Wrench className="text-blue-500" />
      <span>Service Desk</span>
    </div>
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);


const AppLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-md p-4">
                    <h1 className="text-xl font-semibold">Welcome, Admin!</h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />
          <Route path="service-orders" element={<ServiceOrders />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
