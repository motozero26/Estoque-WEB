
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Users, HardDrive, Wrench, Package, Home, FileText, LogOut, UserCog, Briefcase } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Clients from './pages/Clients';
import ServiceOrders from './pages/ServiceOrders';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Technicians from './pages/Technicians';
import Services from './pages/Services';
import { User } from './types';
import * as api from './services/api';

const navItems = [
  { path: '/', label: 'Painel', icon: Home },
  { path: '/suppliers', label: 'Fornecedores', icon: Package },
  { path: '/products', label: 'Produtos', icon: HardDrive },
  { path: '/services', label: 'Serviços', icon: Briefcase },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/service-orders', label: 'Ordens de Serviço', icon: Wrench },
  { path: '/technicians', label: 'Técnicos', icon: UserCog },
  { path: '/reports', label: 'Relatórios', icon: FileText },
];

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col p-4 border-r border-gray-200 dark:border-gray-700">
    <div className="text-2xl font-bold mb-8 flex items-center gap-2">
      <Wrench className="text-blue-500" />
      <span>Gestor OS</span>
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


const AppLayout: React.FC<{ user: User; onLogout: () => void; }> = ({ user, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Bem-vindo, {user.name}!</h1>
                    <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <LogOut size={16} />
                        Sair
                    </button>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// FIX: Changed children type from JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode; }> = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};


function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const handleLogin = async (email: string, pass: string) => {
    const user = await api.login(email, pass);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      navigate('/login');
  };

  return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route 
            path="/*"
            element={
                <ProtectedRoute user={currentUser}>
                    <Routes>
                        <Route path="/" element={<AppLayout user={currentUser!} onLogout={handleLogout} />}>
                            <Route index element={<Dashboard />} />
                            <Route path="suppliers" element={<Suppliers />} />
                            <Route path="products" element={<Products />} />
                            <Route path="services" element={<Services />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="service-orders" element={<ServiceOrders currentUser={currentUser!} />} />
                            <Route path="technicians" element={<Technicians currentUser={currentUser!} />} />
                            <Route path="reports" element={<Reports />} />
                        </Route>
                    </Routes>
                </ProtectedRoute>
            }
        />
      </Routes>
  );
}

const RootApp = () => (
    <HashRouter>
        <App />
    </HashRouter>
)

export default RootApp;