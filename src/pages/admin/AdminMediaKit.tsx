import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { UploadCloud, FileText, Download, Loader2, CheckCircle, AlertCircle, Clock, Search, Mail } from 'lucide-react';
import clsx from 'clsx';

interface Lead {
  id: string;
  email: string;
  created_at: string;
  source: string;
}

const AdminMediaKit = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Current Media Kit Info
      const { data: settings } = await supabase
        .from('media_kit_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (settings && settings.file_url) {
        setCurrentFile({ url: settings.file_url, name: settings.file_name || 'Mídia Kit Atual.pdf' });
      }

      // 2. Fetch Leads (Source = media-kit)
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'media-kit')
        .order('created_at', { ascending: false });

      if (leadsData) {
        setLeads(leadsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Por favor, envie apenas arquivos PDF.');
        return;
    }

    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `mediakit_${Date.now()}.${fileExt}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('media-kits')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('media-kits')
            .getPublicUrl(fileName);

        // 3. Update Settings Table
        const { error: dbError } = await supabase
            .from('media_kit_settings')
            .update({
                file_url: publicUrl,
                file_name: file.name,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (dbError) throw dbError;

        setCurrentFile({ url: publicUrl, name: file.name });
        alert('Mídia Kit atualizado com sucesso!');

    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao atualizar o arquivo.');
    } finally {
        setUploading(false);
    }
  };

  // Filter & Pagination Logic
  const filteredLeads = leads.filter(l => l.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mídia Kit</h1>
        <p className="text-gray-500">Gerencie o arquivo PDF e visualize os downloads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: File Management */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Arquivo Atual
                </h3>

                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : currentFile ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-blue-900 truncate" title={currentFile.name}>
                                    {currentFile.name}
                                </p>
                                <a 
                                    href={currentFile.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                >
                                    <Download size={12} /> Baixar para testar
                                </a>
                            </div>
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 flex items-center gap-3 text-yellow-700">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">Nenhum arquivo configurado.</span>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Atualizar Arquivo (PDF)</label>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="mk-upload"
                            disabled={uploading}
                        />
                        <label 
                            htmlFor="mk-upload"
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50/50",
                                uploading ? "opacity-50 cursor-not-allowed" : ""
                            )}
                        >
                            {uploading ? (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-xs">Enviando...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <UploadCloud className="mb-2" size={24} />
                                    <span className="text-xs font-bold">Clique para substituir</span>
                                    <span className="text-[10px] text-gray-400 mt-1">Apenas arquivos PDF</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Leads Table */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Downloads Realizados</h3>
                        <p className="text-xs text-gray-500">Lista de interessados que baixaram o material.</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar e-mail..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                                <th className="px-6 py-4">E-mail do Lead</th>
                                <th className="px-6 py-4">Data do Download</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin inline-block mr-2" size={16} /> Carregando...
                                    </td>
                                </tr>
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail size={32} className="text-gray-300" />
                                            <p>Nenhum download registrado ainda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{lead.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                                                Capturado
                                            </span>
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaKit;
