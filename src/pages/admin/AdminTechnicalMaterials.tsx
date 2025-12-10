import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Filter, Edit, Trash2, Plus, Loader2, AlertCircle, FileText, Download, User } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';

interface TechnicalMaterial {
  id: string;
  title: string;
  category: string;
  author?: string;
  status: 'published' | 'draft' | 'archived';
  downloads: number;
  created_at: string;
  publish_date?: string;
}

const AdminTechnicalMaterials = () => {
  const navigate = useNavigate();
  const { region } = useRegion();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<TechnicalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, [region]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('technical_materials')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMaterials(data as TechnicalMaterial[]);
    } catch (err: any) {
      console.error('Erro ao buscar materiais:', err);
      setError(err.message);
      addToast('error', 'Erro ao carregar materiais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;
    try {
      const { error } = await supabase.from('technical_materials').delete().eq('id', id);
      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== id));
      addToast('success', 'Material excluído.');
    } catch (err: any) {
      addToast('error', 'Erro ao excluir: ' + err.message);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || material.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais Técnicos ({region.toUpperCase()})</h1>
          <p className="text-gray-500">Gerencie manuais e normas para {region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}.</p>
        </div>
        <button 
          onClick={() => navigate(`/${region}/admin/materials/new`)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Material
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
                <h3 className="text-sm font-bold text-red-800">Erro ao carregar dados</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar por título ou autor..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Autor / Fonte</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
              ) : filteredMaterials.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><FileText size={32} className="mx-auto mb-2 text-gray-300" />Nenhum material encontrado.</td></tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm line-clamp-1" title={material.title}>{material.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            {material.publish_date ? new Date(material.publish_date).toLocaleDateString() : '-'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {material.author ? (
                            <div className="flex items-center gap-1.5">
                                <User size={12} className="text-gray-400" />
                                {material.author}
                            </div>
                        ) : '-'}
                    </td>
                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">{material.category}</span></td>
                    <td className="px-6 py-4">
                        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1.5", material.status === 'published' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                            <span className={clsx("w-1.5 h-1.5 rounded-full", material.status === 'published' ? "bg-green-600" : "bg-gray-500")}></span>
                            {material.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600"><div className="flex items-center gap-1"><Download size={14} className="text-gray-400" /> {material.downloads}</div></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/${region}/admin/materials/edit/${material.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(material.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTechnicalMaterials;
