import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ExpenseModal = ({ isOpen, onClose, expense, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    merchant_name: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    transaction_type: 'DEBIT',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount,
        merchant_name: expense.merchant_name || '',
        category: expense.category || '',
        date: expense.date,
        description: expense.description || '',
        transaction_type: expense.transaction_type || 'DEBIT',
      });
    } else {
      setFormData({
        amount: '',
        merchant_name: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        transaction_type: 'DEBIT',
      });
    }
  }, [expense, isOpen]);

  useEffect(() => {
    if (isOpen) {
      api.get('categories/').then(res => setCategories(res.data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (expense) {
        await api.patch(`expenses/${expense.id}/`, formData);
        toast.success('Transaction updated');
      } else {
        await api.post('expenses/', formData);
        toast.success('Transaction added');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error('Failed to save transaction');
      console.error('Save failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            {expense ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({...formData, transaction_type: 'DEBIT'})}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.transaction_type === 'DEBIT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, transaction_type: 'CREDIT'})}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.transaction_type === 'CREDIT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Amount</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Merchant</label>
            <input
              type="text"
              required
              value={formData.merchant_name}
              onChange={e => setFormData({ ...formData, merchant_name: e.target.value })}
              className="input-field"
              placeholder="e.g. Starbucks, Amazon"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="What was this for?"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Expense</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
