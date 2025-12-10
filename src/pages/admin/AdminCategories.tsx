import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Newspaper, BookOpen, Book, Calendar, Package, Factory, Plus, Edit2, Trash2, Save, X, Loader2, Tag } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';

type CategoryType = 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  region: string;
}

const AdminCategories = () => {
  const { region } = useRegion();
  const [activeType, setActiveType] = useState<CategoryType>('news');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const menuItems = [
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'technical', label: 'Materiais Técnicos', icon: BookOpen },
    { id: 'ebook', label: 'E-books', icon: Book },
    { id: 'event', label: 'Eventos', icon: Calendar },
    { id: 'supplier', label: 'Fornecedores', icon: Package },
    { id: 'foundry', label: 'Fundições', icon: Factory },
  ];

  useEffect(() => {
    fetchCategories();
  }, [activeType, region]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', activeType)
        .eq('region', region) // Filtro por Região
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await supabase.from('categories').update({ name: formName }).eq('id', editingCategory.id);
      } else {
        await supabase.from('categories').insert([{ name: formName, type: activeType, region: region }]);
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir categoria?')) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao excluir.');
    }
  };

  const activeLabel = menuItems.find(i => i.id === activeType)?.label;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categorias ({region.toUpperCase()})</h1>
        <p className="text-gray-500">Gerencie as categorias para {region === 'pt' ? 'Brasil' : 'Outros'}.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-72 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
          <nav className="flex flex-col p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveType(item.id as CategoryType)}
                  className={clsx("flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all", activeType === item.id ? "bg-orange-50 text-primary" : "text-gray-600 hover:bg-gray-50")}
                >
                  <Icon size={20} /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900">{activeLabel}</h2>
            <button onClick={() => { setEditingCategory(null); setFormName(''); setIsModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2">
              <Plus size={18} /> Nova
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : (
              <div className="grid grid-cols-1 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingCategory(category); setFormName(category.name); setIsModalOpen(true); }} className="text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(category.id)} className="text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold mb-4">{editingCategory ? 'Editar' : 'Nova'} Categoria</h3>
            <form onSubmit={handleSave}>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full border p-2 rounded mb-4" placeholder="Nome" autoFocus />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded">{saving ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
