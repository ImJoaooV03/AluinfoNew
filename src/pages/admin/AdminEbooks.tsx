import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Edit, Trash2, Plus, Loader2, Book, Download, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  downloads: number;
  cover_url?: string;
  pages?: number;
  price?: number;
}

const AdminEbooks = () => {
  const navigate = useNavigate();
  const { region } = useRegion();
  const { addToast } = useToast();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEbooks();
  }, [region]);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setEbooks(data as Ebook[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      addToast('error', 'Erro ao carregar e-books.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este e-book?')) return;
    try {
      const { error } = await supabase.from('ebooks').delete().eq('id', id);
      if (error) throw error;
      setEbooks(ebooks.filter(e => e.id !== id));
      addToast('success', 'E-book excluído.');
    } catch (err: any) {
      addToast('error', 'Erro ao excluir: ' + err.message);
    }
  };

  const filteredEbooks = ebooks.filter(ebook => 
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-books ({region.toUpperCase()})</h1>
          <p className="text-gray-500">Biblioteca digital e materiais ricos.</p>
        </div>
        <button 
            onClick={() => navigate(`/${region}/admin/ebooks/new`)} 
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
            <Plus size={18} /> Novo E-book
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
                placeholder="Buscar por título ou autor..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="px-6 py-4">E-book</th>
                        <th className="px-6 py-4">Autor</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Downloads</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
                    ) : filteredEbooks.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><Book size={32} className="mx-auto mb-2 text-gray-300" />Nenhum e-book encontrado.</td></tr>
                    ) : (
                        filteredEbooks.map(ebook => (
                            <tr key={ebook.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                            {ebook.cover_url ? (
                                                <img src={ebook.cover_url} alt={ebook.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Book size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm line-clamp-1" title={ebook.title}>{ebook.title}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                {ebook.pages && <span>{ebook.pages} págs</span>}
                                                {ebook.price && Number(ebook.price) > 0 ? (
                                                    <span className="text-green-600 font-bold">R$ {ebook.price}</span>
                                                ) : (
                                                    <span className="text-blue-600 font-bold">Grátis</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {ebook.author || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                                        {ebook.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1.5",
                                        ebook.status === 'published' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                    )}>
                                        <span className={clsx("w-1.5 h-1.5 rounded-full", ebook.status === 'published' ? "bg-green-600" : "bg-gray-500")}></span>
                                        {ebook.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Download size={14} className="text-gray-400" />
                                        {ebook.downloads || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => navigate(`/${region}/admin/ebooks/edit/${ebook.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(ebook.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
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

export default AdminEbooks;
