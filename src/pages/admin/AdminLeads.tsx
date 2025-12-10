import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Trash2, Loader2, Mail, Download, FileText, Filter, Users } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

interface Lead {
  id: string;
  email: string;
  source: string;
  asset_name?: string;
  created_at: string;
}

const AdminLeads = () => {
  const { region } = useRegion();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [region]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('region', region) // Filtro Estrito por Região
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) { 
      console.error(err);
      addToast('error', 'Erro ao carregar leads.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      setLeads(leads.filter(l => l.id !== id));
      addToast('success', 'Lead excluído com sucesso.');
    } catch (err: any) { 
      addToast('error', 'Erro ao excluir: ' + err.message); 
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
        addToast('error', 'Não há dados para exportar.');
        return;
    }

    // Cabeçalho do CSV
    const headers = ['Email', 'Origem', 'Material Baixado', 'Data de Cadastro', 'Região'];
    
    // Linhas
    const rows = leads.map(lead => [
        lead.email,
        lead.source,
        lead.asset_name || '-',
        new Date(lead.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(lead.created_at).toLocaleTimeString('pt-BR'),
        region.toUpperCase()
    ]);

    // Montar CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Criar Blob e Link de Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_aluinfo_${region}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.asset_name && l.asset_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterSource === 'all' || l.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  const getSourceBadge = (source: string) => {
    switch(source) {
        case 'newsletter': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Newsletter</span>;
        case 'ebook': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">E-book</span>;
        case 'technical': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase">Técnico</span>;
        case 'media-kit': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">Mídia Kit</span>;
        default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">{source}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Leads ({region.toUpperCase()})</h1>
          <p className="text-gray-500">Base de contatos capturados via formulários e downloads.</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-md border border-gray-200 text-sm font-bold shadow-sm flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Total: {leads.length}
            </div>
            <button 
                onClick={handleExportCSV}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
                <Download size={18} />
                Exportar CSV
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar por e-mail ou material..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select 
                value={filterSource} 
                onChange={(e) => setFilterSource(e.target.value)} 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2"
            >
                <option value="all">Todas as Origens</option>
                <option value="newsletter">Newsletter</option>
                <option value="ebook">E-books</option>
                <option value="technical">Materiais Técnicos</option>
                <option value="media-kit">Mídia Kit</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="px-6 py-4">Lead / E-mail</th>
                        <th className="px-6 py-4">Origem</th>
                        <th className="px-6 py-4">Material / Interesse</th>
                        <th className="px-6 py-4">Data de Cadastro</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Carregando leads...</td></tr>
                    ) : filteredLeads.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><Mail size={32} className="mx-auto mb-2 text-gray-300" />Nenhum lead encontrado.</td></tr>
                    ) : (
                        filteredLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                            <Mail size={14} />
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{lead.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getSourceBadge(lead.source)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {lead.asset_name ? (
                                        <div className="flex items-center gap-2" title={lead.asset_name}>
                                            <FileText size={14} className="text-gray-400" />
                                            <span className="truncate max-w-xs">{lead.asset_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(lead.id)} 
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Excluir Lead"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <span>Mostrando {filteredLeads.length} de {leads.length} registros</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
