import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { UploadCloud, FileText, Download, Loader2, Trash2, Search, Calendar, Mail, Eye } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';

const AdminMediaKit = () => {
  const { region } = useRegion();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string; updated_at: string } | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [region]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Media Kit for CURRENT REGION
      const { data: settings } = await supabase
        .from('media_kit_settings')
        .select('*')
        .eq('region', region)
        .maybeSingle();

      if (settings && settings.file_url) {
        setCurrentFile({ 
            url: settings.file_url, 
            name: settings.file_name || 'Mídia Kit.pdf',
            updated_at: settings.updated_at
        });
      } else {
        setCurrentFile(null);
      }

      // 2. Fetch Leads for CURRENT REGION
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'media-kit')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (leadsData) setLeads(leadsData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addToast('error', 'Erro ao carregar informações.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validação básica
    if (file.type !== 'application/pdf') {
        addToast('error', 'Apenas arquivos PDF são permitidos.');
        return;
    }

    setUploading(true);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${region}_mediakit_${Date.now()}.${fileExt}`;

        // Upload
        const { error: uploadError } = await supabase.storage.from('media-kits').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('media-kits').getPublicUrl(fileName);

        // Upsert Settings for this Region
        const { error: dbError } = await supabase
            .from('media_kit_settings')
            .upsert({
                region: region,
                file_url: publicUrl,
                file_name: file.name,
                updated_at: new Date().toISOString()
            }, { onConflict: 'region' });

        if (dbError) throw dbError;

        setCurrentFile({ 
            url: publicUrl, 
            name: file.name,
            updated_at: new Date().toISOString()
        });
        addToast('success', 'Mídia Kit atualizado com sucesso!');
    } catch (error: any) {
        console.error(error);
        addToast('error', 'Erro no upload: ' + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!window.confirm('Tem certeza que deseja remover o Mídia Kit atual? O download ficará indisponível.')) return;

    try {
        const { error } = await supabase
            .from('media_kit_settings')
            .update({ file_url: null, file_name: null, updated_at: new Date().toISOString() })
            .eq('region', region);

        if (error) throw error;

        setCurrentFile(null);
        addToast('success', 'Arquivo removido.');
    } catch (error) {
        addToast('error', 'Erro ao remover arquivo.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Excluir este lead do histórico?')) return;
    try {
        await supabase.from('leads').delete().eq('id', id);
        setLeads(leads.filter(l => l.id !== id));
        addToast('success', 'Lead excluído.');
    } catch (error) {
        addToast('error', 'Erro ao excluir lead.');
    }
  };

  const filteredLeads = leads.filter(l => l.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mídia Kit ({region.toUpperCase()})</h1>
        <p className="text-gray-500">Gerencie o arquivo PDF e visualize quem baixou o material na região {region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: File Management */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-primary" /> Arquivo Atual
                </h3>
                
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : currentFile ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 relative group">
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded border border-blue-100 text-red-500">
                                <FileText size={24} />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-bold text-blue-900 truncate" title={currentFile.name}>{currentFile.name}</p>
                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <Calendar size={10} /> 
                                    {new Date(currentFile.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <a 
                                href={currentFile.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-white border border-blue-200 text-blue-700 text-xs font-bold py-2 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye size={14} /> Visualizar
                            </a>
                            <button 
                                onClick={handleRemoveFile}
                                className="px-3 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                                title="Remover Arquivo"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 text-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                            <FileText size={24} />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhum arquivo configurado.</p>
                        <p className="text-xs text-gray-400 mt-1">O botão de download ficará indisponível no site.</p>
                    </div>
                )}

                <div className="relative">
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="mk-upload" disabled={uploading} />
                    <label 
                        htmlFor="mk-upload" 
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group",
                            uploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin text-primary" size={24} />
                        ) : (
                            <>
                                <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <span className="text-sm font-medium text-gray-600">
                                    {currentFile ? 'Substituir PDF' : 'Enviar PDF'}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Máximo 50MB</span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Total de Downloads</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{leads.length}</span>
                    <span className="text-xs text-gray-500">interessados</span>
                </div>
            </div>
        </div>

        {/* Right Column: Leads List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Download size={20} className="text-primary" /> Histórico de Downloads
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar e-mail..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    </div>
                </div>
                
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold">E-mail</th>
                                <th className="p-4 font-semibold">Data</th>
                                <th className="p-4 text-right font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan={3} className="p-12 text-center text-gray-500">Nenhum download registrado ainda.</td></tr>
                            ) : (
                                filteredLeads.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <Mail size={14} />
                                                </div>
                                                <span className="font-medium text-gray-900">{l.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteLead(l.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Excluir registro"
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
                
                {/* Footer / Pagination Placeholder */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                    <span>Mostrando {filteredLeads.length} registros</span>
                </div>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaKit;
