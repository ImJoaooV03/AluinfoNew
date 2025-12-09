import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Trash2, Loader2, AlertCircle, Mail, Download, FileText, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface Lead {
  id: string;
  email: string;
  source: string;
  asset_name?: string;
  created_at: string;
}

const AdminLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setLeads(data as Lead[]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar leads:', err);
      setError(err.message || 'Falha ao carregar leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(leads.filter(l => l.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getSourceBadge = (source: string) => {
    switch (source.toLowerCase()) {
      case 'newsletter':
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <Mail size={12} /> Newsletter
          </span>
        );
      case 'ebook':
        return (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <BookOpen size={12} /> E-book
          </span>
        );
      case 'technical':
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <FileText size={12} /> Técnico
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <Download size={12} /> {source}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Leads</h1>
          <p className="text-gray-500">Base de contatos capturados via newsletter e downloads.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
            Total de Leads: <span className="text-primary font-bold">{leads.length}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
                <h3 className="text-sm font-bold text-red-800">Erro ao carregar dados</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('relation "leads" does not exist') && (
                    <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
                        A tabela 'leads' não existe. Execute o script de migração no Supabase.
                    </p>
                )}
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por e-mail..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Fonte de Origem</th>
                <th className="px-6 py-4">Material / Detalhe</th>
                <th className="px-6 py-4">Data de Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Carregando leads...
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Mail size={32} className="text-gray-300" />
                        <p>Nenhum lead encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getSourceBadge(lead.source)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lead.asset_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                        title="Excluir"
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

        {/* Pagination */}
        {!loading && filteredLeads.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                <span>
                    Mostrando {((page - 1) * itemsPerPage) + 1} a {Math.min(page * itemsPerPage, filteredLeads.length)} de {filteredLeads.length}
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
