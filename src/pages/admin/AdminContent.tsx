import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminArticles } from '../../data/adminMockData';
import { Search, Filter, Edit, Trash2, FilePlus, Eye, Calendar } from 'lucide-react';
import clsx from 'clsx';

const AdminContent = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Conteúdo</h1>
          <p className="text-gray-500">Notícias, artigos técnicos e e-books.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <FilePlus size={18} />
          Nova Publicação
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} /> Filtros
            </button>
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
              {adminArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm line-clamp-1 max-w-xs" title={article.title}>
                        {article.title}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Eye size={10} /> {article.views} visualizações
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                        {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {article.author}
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
                        {article.publishDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
