import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Newspaper, BookOpen, Book, Calendar, Package, Factory, Plus, Edit2, Trash2, Loader2, CornerDownRight, Folder, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';
import { Category, useCategories } from '../../hooks/useCategories';
import { useToast } from '../../contexts/ToastContext';

type CategoryType = 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry';

const AdminCategories = () => {
  const { region } = useRegion();
  const { addToast } = useToast();
  const [activeType, setActiveType] = useState<CategoryType>('news');
  
  // Agora o refetch funciona corretamente graças à atualização no hook
  const { categories, hierarchicalCategories, loading, refetch } = useCategories(activeType);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
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
    if (!isModalOpen) {
        setFormName('');
        setFormParentId('');
        setEditingCategory(null);
    }
  }, [isModalOpen]);

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormParentId(cat.parent_id || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: formName,
        type: activeType,
        region: region,
        parent_id: formParentId || null
      };

      if (editingCategory) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
        addToast('success', 'Categoria atualizada!');
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
        addToast('success', 'Categoria criada!');
      }
      
      refetch(); // Atualiza a lista sem recarregar a página
      setIsModalOpen(false); // Fecha o modal
      
    } catch (error: any) {
      addToast('error', 'Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir categoria? Se ela tiver subcategorias, elas ficarão sem pai.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      
      addToast('success', 'Categoria excluída.');
      refetch(); // Atualiza a lista sem recarregar a página
      
    } catch (error: any) {
      addToast('error', 'Erro ao excluir: ' + error.message);
    }
  };

  const activeLabel = menuItems.find(i => i.id === activeType)?.label;
  
  // Opções para o select de "Pai" (evita que uma categoria seja pai dela mesma ou de categorias de outro tipo)
  const parentOptions = categories.filter(c => !c.parent_id && c.id !== editingCategory?.id);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categorias ({region.toUpperCase()})</h1>
        <p className="text-gray-500">Gerencie a estrutura de categorias e subcategorias.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar de Tipos */}
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

        {/* Lista de Categorias */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900">{activeLabel}</h2>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
              <Plus size={18} /> Nova Categoria
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div> : (
              <div className="space-y-3">
                {hierarchicalCategories.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Nenhuma categoria cadastrada.</p>
                ) : (
                    hierarchicalCategories.map((parent) => (
                    <div key={parent.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* Categoria Pai */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded border border-gray-200 text-primary">
                                    <Folder size={18} />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-800 block">{parent.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{parent.subcategories?.length || 0} subcategorias</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEdit(parent)} className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(parent.id)} className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {/* Subcategorias */}
                        {parent.subcategories && parent.subcategories.length > 0 && (
                            <div className="bg-white divide-y divide-gray-50">
                                {parent.subcategories.map(child => (
                                    <div key={child.id} className="flex justify-between items-center py-3 pl-12 pr-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <CornerDownRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                            {child.name}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(child)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(child.id)} className="text-red-600 hover:bg-red-100 p-1.5 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-900">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Categoria</label>
                    <input 
                        type="text" 
                        value={formName} 
                        onChange={e => setFormName(e.target.value)} 
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        placeholder="Ex: Equipamentos" 
                        autoFocus 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria Pai (Hierarquia)</label>
                    <div className="relative">
                        <FolderOpen className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <select 
                            value={formParentId} 
                            onChange={e => setFormParentId(e.target.value)}
                            className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white appearance-none"
                        >
                            <option value="">Nenhuma (É uma Categoria Principal)</option>
                            {parentOptions.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 ml-1">
                        Selecione uma categoria pai para criar uma subcategoria (ex: Fornos dentro de Equipamentos).
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : 'Salvar'}
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
