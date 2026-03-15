import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, CreditCard, PieChart as PieChartIcon, 
  Settings, LogOut, Plus, TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, Wallet, Calendar, Bell, Search, Filter,
  Edit2, Trash2
} from 'lucide-react';
import api from '../services/api';
import ExpenseModal from '../components/ExpenseModal';
import toast from 'react-hot-toast';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    total_spent: 0, 
    total_income: 0, 
    wallet_balance: 0, 
    category_breakdown: [] 
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, expensesRes] = await Promise.all([
        api.get('analytics/summary/'),
        api.get('expenses/')
      ]);
      setStats(statsRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`expenses/${id}/`);
        toast.success('Transaction deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete transaction');
        console.error('Delete failed', err);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const trendData = [
    { name: 'Mon', amount: 45 },
    { name: 'Tue', amount: 32 },
    { name: 'Wed', amount: 56 },
    { name: 'Thu', amount: 28 },
    { name: 'Fri', amount: 89 },
    { name: 'Sat', amount: 120 },
    { name: 'Sun', amount: 35 },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in relative z-10">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-64" />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button 
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Add Expense
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-primary-100 font-medium">Wallet Balance</p>
          <h3 className="text-3xl font-bold mt-1 font-outfit">₱{stats.wallet_balance?.toLocaleString() || '0'}</h3>
        </div>

        <div className="card border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium">Total Income</p>
          <h3 className="text-3xl font-bold mt-1 font-outfit text-emerald-600">₱{stats.total_income?.toLocaleString() || '0'}</h3>
        </div>

        <div className="card border-l-4 border-rose-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium">Total Spent</p>
          <h3 className="text-3xl font-bold mt-1 font-outfit text-rose-600">₱{stats.total_spent?.toLocaleString() || '0'}</h3>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium">Days to Reset</p>
          <h3 className="text-3xl font-bold mt-1 font-outfit">12 Days</h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Spending Trend</h3>
            <select className="bg-slate-50 border-none text-sm text-slate-500 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Category Distribution</h3>
            <button className="text-primary-600 text-sm font-semibold">View All</button>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.category_breakdown.length > 0 ? stats.category_breakdown.map(c => ({ name: c.category__name || 'Unknown', value: parseFloat(c.total || 0) })) : [{ name: 'Food', value: 400 }, { name: 'Rent', value: 1200 }, { name: 'Utils', value: 300 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-3">
              {(stats.category_breakdown.length > 0 ? stats.category_breakdown : [{ category__name: 'Housing', total: 1200 }, { category__name: 'Food', total: 450 }]).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                    <span className="text-sm text-slate-600">{item.category__name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₱{parseFloat(item.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
            <Filter size={18} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-100">
                <th className="pb-4 font-medium">Merchant</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.length > 0 ? expenses.map((expense) => (
                <tr key={expense.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {expense.merchant_name?.[0] || 'U'}
                      </div>
                      <span className="font-semibold text-slate-900">{expense.merchant_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {expense.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 text-sm">{expense.date}</td>
                  <td className="py-4">
                    <span className={`flex items-center gap-1 text-xs font-medium ${expense.is_automated ? 'text-primary-600' : 'text-amber-600'}`}>
                      {expense.is_automated ? 'Automatic' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    <div className="flex items-center justify-end gap-2">
                      <span className={expense.transaction_type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}>
                        {expense.transaction_type === 'CREDIT' ? '+' : '-'}₱{parseFloat(expense.amount).toLocaleString()}
                      </span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <button 
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No transactions found. Start by adding an expense or forwarding an email.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        expense={editingExpense}
        onSave={fetchData}
      />
    </div>
  );
};

export default Dashboard;
