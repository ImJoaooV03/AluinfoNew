import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { 
  Newspaper, BookOpen, Book, Calendar, Package, Factory, 
  Plus, Edit2, Trash2, Save, X, Loader2, Tag, Search
} from 'lucide-react';
import clsx from 'clsx';

// Tipos de Categorias suportados
type CategoryType = 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

const AdminCategories = () => {
  const [activeType, setActiveType] = useState<CategoryType>('news');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Modal/Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  // Configuração do Menu Lateral (Baseado na imagem)
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
  }, [activeType]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', activeType)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormName(category.name);
    } else {
      setEditingCategory(null);
      setFormName('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({ name: formName })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert([{ name: formName, type: activeType }]);
        if (error) throw error;
      }
      
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir categoria.');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeLabel = menuItems.find(i => i.id === activeType)?.label;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
        <p className="text-gray-500">Defina as opções disponíveis para cada seção do portal.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar - Menu */}
        <div className="w-full lg:w-72 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seções</h3>
          </div>
          <nav className="flex flex-col p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveType(item.id as CategoryType)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                    isActive 
                      ? "bg-orange-50 text-primary shadow-sm ring-1 ring-orange-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content - List */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-primary rounded-lg">
                    <Tag size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Categorias de {activeLabel}</h2>
                    <p className="text-xs text-gray-500">{categories.length} categorias cadastradas</p>
                </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus size={18} />
              Nova Categoria
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder={`Buscar categorias de ${activeLabel?.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Tag size={48} className="mb-3 opacity-20" />
                <p>Nenhuma categoria encontrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all bg-white group"
                  >
                    <span className="font-medium text-gray-700">{category.name}</span>
                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Categoria</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: Inovação"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                    Esta categoria será adicionada em <strong>{activeLabel}</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving || !formName.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
