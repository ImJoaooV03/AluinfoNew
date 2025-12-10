import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Filter, Edit, Trash2, Plus, Loader2, Megaphone, AlertCircle, Layout, ExternalLink } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

interface Ad {
  id: string;
  title: string;
  position: string;
  status: string;
  image_url: string;
  link_url?: string;
  clicks?: number;
  views?: number;
}

const positionLabels: Record<string, string> = {
  'top_large': 'Topo Grande (Desktop)',
  'top_large_mobile': 'Topo Grande (Mobile)',
  'sidebar_1': 'Lateral 1 (Topo)',
  'sidebar_2': 'Lateral 2 (Meio)',
  'sidebar_3': 'Lateral 3 (Baixo)',
  'sidebar_4': 'Lateral 4 (Fim)',
  'home_middle_1': 'Home Meio 1',
  'home_middle_2': 'Home Meio 2',
  'home_final': 'Home Final'
};

const AdminAds = () => {
  const navigate = useNavigate();
  const { region } = useRegion();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAds();
  }, [region]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data as Ad[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      addToast('error', 'Erro ao carregar anúncios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) return;
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
      setAds(ads.filter(a => a.id !== id));
      addToast('success', 'Anúncio excluído.');
    } catch (err: any) {
      addToast('error', 'Erro ao excluir: ' + err.message);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ad.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Publicidade ({region.toUpperCase()})</h1>
            <p className="text-gray-500">Gerencie banners e campanhas para {region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}.</p>
        </div>
        <button 
            onClick={() => navigate(`/${region}/admin/ads/new`)} 
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
            <Plus size={18} /> Novo Anúncio
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
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar campanha..." 
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
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="px-6 py-4">Banner / Campanha</th>
                        <th className="px-6 py-4">Posição</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Métricas</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
                    ) : filteredAds.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><Megaphone size={32} className="mx-auto mb-2 text-gray-300" />Nenhum anúncio encontrado.</td></tr>
                    ) : (
                        filteredAds.map(ad => (
                            <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                            {ad.image_url ? (
                                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Megaphone size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{ad.title}</div>
                                            {ad.link_url && (
                                                <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    Link <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Layout size={14} className="text-gray-400" />
                                        {positionLabels[ad.position] || ad.position}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1.5",
                                        ad.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                    )}>
                                        <span className={clsx("w-1.5 h-1.5 rounded-full", ad.status === 'active' ? "bg-green-600" : "bg-gray-500")}></span>
                                        {ad.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    <div>Views: <strong>{ad.views || 0}</strong></div>
                                    <div>Cliques: <strong>{ad.clicks || 0}</strong></div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => navigate(`/${region}/admin/ads/edit/${ad.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
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
