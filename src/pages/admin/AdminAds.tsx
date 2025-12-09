import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Filter, Edit, Trash2, Plus, Loader2, AlertCircle, Eye, MousePointer, Calendar, Megaphone, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface Ad {
  id: string;
  title: string;
  position: string;
  status: 'active' | 'inactive' | 'scheduled';
  views: number;
  clicks: number;
  image_url: string;
  client_name?: string;
  end_date?: string;
  display_order: number;
}

const AdminAds = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false }); // Mostra os mais recentes primeiro

      if (error) {
        throw error;
      }

      if (data) {
        setAds(data as Ad[]);
      }
    } catch (err: any) {
      console.error('Erro crítico ao buscar anúncios:', err);
      setError(err.message || 'Falha ao carregar os anúncios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAds(ads.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ad.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getPositionLabel = (pos: string) => {
    const map: Record<string, string> = {
      'top_large': 'Banner Topo Grande',
      'top_large_mobile': 'Banner Topo Grande - Mobile',
      'home_middle_1': 'Banner Meio 1',
      'home_middle_2': 'Banner Meio 2',
      'home_final': 'Banner Final',
      'sidebar_1': 'Banner Lateral 1',
      'sidebar_2': 'Banner Lateral 2',
      'sidebar_3': 'Banner Lateral 3',
      'sidebar_4': 'Banner Lateral 4',
    };
    return map[pos] || pos;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Publicidade</h1>
          <p className="text-gray-500">Controle de banners, parceiros e campanhas.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/ads/new')}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Anúncio
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <h3 className="text-sm font-bold text-red-800">Erro ao carregar dados</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            </div>
            <button 
                onClick={fetchAds}
                className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-bold rounded hover:bg-red-50 transition-colors flex items-center gap-2"
            >
                <RefreshCw size={16} /> Tentar Novamente
            </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar campanha ou cliente..." 
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="scheduled">Agendados</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4">Campanha / Banner</th>
                <th className="px-6 py-4">Posição (Slot)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Desempenho</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <span className="font-medium">Carregando anúncios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Megaphone size={32} className="text-gray-300" />
                        <p>Nenhum anúncio encontrado.</p>
                        <button 
                            onClick={() => navigate('/admin/ads/new')}
                            className="text-primary text-sm font-bold hover:underline mt-1"
                        >
                            Criar primeira campanha
                        </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                            {ad.image_url ? (
                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">Sem img</div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">{ad.title}</div>
                            <div className="text-xs text-gray-500">{ad.client_name || 'Cliente Interno'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                          {getPositionLabel(ad.position)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1.5",
                        ad.status === 'active' ? "bg-green-100 text-green-700" :
                        ad.status === 'inactive' ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", 
                          ad.status === 'active' ? "bg-green-600" :
                          ad.status === 'inactive' ? "bg-red-600" :
                          "bg-yellow-600"
                        )}></span>
                        {ad.status === 'active' ? 'Ativo' : ad.status === 'inactive' ? 'Inativo' : 'Agendado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1" title="Visualizações">
                                <Eye size={12} className="text-gray-400" /> 
                                <span className="font-medium">{ad.views?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Cliques">
                                <MousePointer size={12} className="text-gray-400" /> 
                                <span className="font-medium">{ad.clicks?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {ad.end_date ? new Date(ad.end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => navigate(`/admin/ads/edit/${ad.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                            title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(ad.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                            title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
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

export default AdminAds;
