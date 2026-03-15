import React, { useState, useEffect } from 'react';
import { 
  Plus, Wallet, Calendar, TrendingUp, 
  ArrowRight, Loader2, Save, Trash2, Edit2 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        api.get('budgets/'),
        api.get('categories/')
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('budgets/', formData);
      toast.success('Budget set successfully');
      setShowAdd(false);
      setFormData({ ...formData, amount: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to set budget');
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await api.delete(`budgets/${id}/`);
        toast.success('Budget deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete budget');
        console.error('Delete failed', err);
      }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
          <p className="text-slate-500 mt-1">Set monthly spending limits by category</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> New Budget
        </button>
      </div>

      {showAdd && (
        <div className="card border-primary-100 bg-primary-50/30">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select 
                required
                className="input-field"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Monthly Limit</label>
              <input 
                type="number" 
                required
                className="input-field"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Month/Year</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" max="12"
                  className="input-field"
                  value={formData.month}
                  onChange={e => setFormData({...formData, month: e.target.value})}
                />
                <input 
                  type="number"
                  className="input-field"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => (
          <div key={budget.id} className="card group hover:border-primary-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                <Wallet size={24} />
              </div>
              <button 
                onClick={() => handleDelete(budget.id)}
                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{budget.category_name}</h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Limit</p>
                <p className="text-2xl font-black text-slate-900">₱{parseFloat(budget.amount).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Period</p>
                <p className="text-slate-600 font-medium">{budget.month}/{budget.year}</p>
              </div>
            </div>
            <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 w-1/3 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Budgets;
