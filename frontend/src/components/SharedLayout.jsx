import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, PieChart, 
  Settings, LogOut, Wallet, Tag, Menu, X
} from 'lucide-react';

const SharedLayout = ({ children, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Expenses', path: '/dashboard' }, // Expenses are on dashboard for now
    { icon: PieChart, label: 'Analytics', path: '/dashboard' },
    { icon: Wallet, label: 'Budgets', path: '/budgets' },
    { icon: Tag, label: 'Categories', path: '/categories' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-72' : 'w-20'} 
        bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-40
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 shrink-0">
            <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && <span className="text-xl font-black tracking-tight text-slate-900">AutoExpense</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                ${isActive(item.path) 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'}
              `}
            >
              <item.icon size={22} className={isActive(item.path) ? 'text-white' : 'group-hover:text-primary-600'} />
              {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
        {children}
      </main>
    </div>
  );
};

export default SharedLayout;
