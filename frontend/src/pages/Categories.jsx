import React, { useState, useEffect } from 'react';
import { 
  Plus, Tag, Trash2, Edit2, 
  Loader2, Save, X, Search 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Tag' });

  const fetchData = async () => {
    try {
      const res = await api.get('categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingCat(category);
      setFormData({ name: category.name, icon: category.icon || 'Tag' });
    } else {
      setEditingCat(null);
      setFormData({ name: '', icon: 'Tag' });
    }
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.patch(`categories/${editingCat.id}/`, formData);
        toast.success('Category updated');
      } else {
        await api.post('categories/', formData);
        toast.success('Category created');
      }
      setShowAdd(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save category');
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category? This might affect existing expenses.')) {
      try {
        await api.delete(`categories/${id}/`);
        toast.success('Category deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete category');
        console.error('Delete failed', err);
      }
    }
  };

  const suggestions = ['Food', 'Rent', 'Shopping', 'Travel', 'Health', 'Utilities', 'Entertainment'];

  const addSuggested = async (name) => {
    try {
      await api.post('categories/', { name, icon: 'Tag' });
      toast.success(`${name} category added`);
      fetchData();
    } catch (err) {
      toast.error(`Failed to add ${name}`);
      console.error('Failed to add suggested', err);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="animate-spin text-primary-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-fade-in relative z-10">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Organize your expenses with custom labels</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Category Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="input-field"
                  placeholder="e.g. Shopping, Utilities"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {editingCat ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
            <Tag size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No categories yet</h3>
          <p className="text-slate-500 max-w-sm mb-8">
            Create categories to better understand where your money goes. 
            Try adding some common ones:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => addSuggested(s)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div key={category.id} className="card group p-5 hover:border-primary-100 transition-all cursor-default">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 rounded-2xl transition-all duration-300">
                    <Tag size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-lg">{category.name}</span>
                  </div>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => openModal(category)}
                    className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
