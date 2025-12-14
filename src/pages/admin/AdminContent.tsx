import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Filter, Edit, Trash2, FilePlus, Eye, Calendar, Loader2, AlertCircle, Newspaper, Star, User, ExternalLink } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';
import clsx from 'clsx';

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  author_avatar?: string;
  status: 'published' | 'draft' | 'scheduled';
  publish_date: string;
  views: number;
  created_at: string;
  is_highlight: boolean;
}

const AdminContent = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { region } = useRegion();
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, [region]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setArticles(data as NewsArticle[]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar notícias:', err);
      setError(err.message || 'Falha ao carregar conteúdo.');
      addToast('error', 'Erro ao carregar notícias.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(a => a.id !== id));
      addToast('success', 'Notícia excluída com sucesso.');
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Erro ao excluir notícia: ' + err.message);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Notícias ({region.toUpperCase()})</h1>
          <p className="text-gray-500">Publique e edite as notícias do portal {region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}.</p>
        </div>
        <button 
          onClick={() => navigate(`/${region}/admin/content/new`)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <FilePlus size={18} />
          Nova Notícia
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
              <option value="scheduled">Agendados</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Carregando notícias...
                    </div>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Newspaper size={32} className="text-gray-300" />
                        <p>Nenhuma notícia encontrada nesta região.</p>
                        {!error && (
                            <button 
                                onClick={() => navigate(`/${region}/admin/content/new`)}
                                className="text-primary text-sm font-bold hover:underline mt-1"
                            >
                                Criar a primeira notícia
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                          {article.is_highlight && (
                              <Star size={14} className="text-orange-500 fill-orange-500 flex-shrink-0 mt-0.5" title="Destaque" />
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-sm line-clamp-1 max-w-xs" title={article.title}>
                                {article.title}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Eye size={10} /> {article.views || 0} visualizações
                            </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                          {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {article.author_avatar ? (
                            <img src={article.author_avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User size={12} /></div>
                        )}
                        <span className="text-sm text-gray-600">{article.author || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1.5",
                        article.status === 'published' ? "bg-green-100 text-green-700" :
                        article.status === 'draft' ? "bg-gray-100 text-gray-600" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", 
                          article.status === 'published' ? "bg-green-600" :
                          article.status === 'draft' ? "bg-gray-500" :
                          "bg-yellow-600"
                        )}></span>
                        {article.status === 'published' ? 'Publicado' : article.status === 'draft' ? 'Rascunho' : 'Agendado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {article.publish_date ? new Date(article.publish_date).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview Button */}
                        {article.status === 'published' && (
                            <a 
                                href={`/${region}/noticia/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Ver no site"
                            >
                                <ExternalLink size={16} />
                            </a>
                        )}
                        <button 
                            onClick={() => navigate(`/${region}/admin/content/edit/${article.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                            title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(article.id)}
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

export default AdminContent;
