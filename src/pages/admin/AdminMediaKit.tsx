import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { UploadCloud, FileText, Download, Loader2, Trash2, Search, Calendar, Mail, Eye, ExternalLink, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';

const AdminMediaKit = () => {
  const { region } = useRegion();
  const { addToast } = useToast();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string; updated_at: string } | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chave para o LocalStorage baseada na região (Cache Local)
  const STORAGE_KEY = `aluinfo_mediakit_cache_${region}`;

  useEffect(() => {
    fetchData();
  }, [region]);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setUploadError(null);
      
      // 1. Recuperação Otimista (Cache Local)
      // Mostra o arquivo imediatamente se já tivermos visto ele antes
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(STORAGE_KEY);
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                setCurrentFile(parsed);
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
      }

      // 2. Busca Real no Banco de Dados (Fonte da Verdade)
      const { data: settings, error: settingsError } = await supabase
        .from('media_kit_settings')
        .select('*')
        .eq('region', region)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (settings && settings.file_url) {
        const fileData = { 
            url: settings.file_url, 
            name: settings.file_name || 'Mídia Kit',
            updated_at: settings.updated_at
        };
        
        // Atualiza estado e cache com a verdade do banco
        setCurrentFile(fileData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fileData));
        
        if (forceRefresh) addToast('success', 'Sincronizado com sucesso.');
      } else {
        // Se o banco diz que não tem nada, limpamos o estado
        // (A menos que seja a primeira carga e tenhamos cache, mas se for refresh forçado, limpamos)
        if (forceRefresh || !currentFile) {
            setCurrentFile(null);
            localStorage.removeItem(STORAGE_KEY);
        }
      }

      // 3. Buscar Histórico de Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'media-kit')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      if (leadsData) setLeads(leadsData);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      // Não mostramos erro na tela se for apenas falha de rede e tivermos cache
      if (forceRefresh) addToast('error', 'Erro de conexão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validação de Tipo
    const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-powerpoint' // .ppt
    ];

    if (!allowedTypes.includes(file.type)) {
        const msg = 'Formato inválido. Apenas PDF e PowerPoint (PPTX) são permitidos.';
        setUploadError(msg);
        addToast('error', msg);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    // Validação de Tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
        const msg = 'O arquivo excede o limite máximo de 50MB.';
        setUploadError(msg);
        addToast('error', msg);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    setUploading(true);

    try {
        // Nome único para evitar cache do navegador no arquivo antigo
        const fileExt = file.name.split('.').pop();
        const fileName = `${region}_mediakit_${Date.now()}.${fileExt}`;

        // 1. Upload para o Storage
        const { error: uploadError } = await supabase.storage
            .from('media-kits')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Obter URL Pública
        const { data: { publicUrl } } = supabase.storage
            .from('media-kits')
            .getPublicUrl(fileName);

        // 2. Atualizar Banco de Dados (UPSERT - Criar ou Atualizar)
        const payload = {
            region: region,
            file_url: publicUrl,
            file_name: file.name,
            updated_at: new Date().toISOString()
        };

        const { error: dbError } = await supabase
            .from('media_kit_settings')
            .upsert(payload, { onConflict: 'region' });

        if (dbError) throw dbError;

        // 3. Atualizar Interface Imediatamente (Feedback Instantâneo)
        const newFileData = {
            url: publicUrl,
            name: file.name,
            updated_at: new Date().toISOString()
        };
        
        setCurrentFile(newFileData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFileData));

        addToast('success', 'Mídia Kit salvo e publicado!');
        
        // Limpar input
        if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
        console.error('Erro no upload:', error);
        let errorMsg = 'Erro ao fazer upload.';
        if (error.statusCode === '413') errorMsg = 'Arquivo muito grande (Max 50MB).';
        else if (error.message) errorMsg = error.message;

        setUploadError(errorMsg);
        addToast('error', errorMsg);
    } finally {
        setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!window.confirm('Tem certeza que deseja remover o Mídia Kit atual? O download ficará indisponível.')) return;

    try {
        // Remove do banco
        const { error } = await supabase
            .from('media_kit_settings')
            .delete()
            .eq('region', region);

        if (error) throw error;

        // Limpa estado e cache
        setCurrentFile(null);
        localStorage.removeItem(STORAGE_KEY);
        addToast('success', 'Arquivo removido com sucesso.');
    } catch (error: any) {
        addToast('error', 'Erro ao remover: ' + error.message);
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
        <p className="text-gray-500">Gerencie o arquivo PDF/PPTX disponível para download na página "Anuncie".</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Gerenciamento do Arquivo */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} className="text-primary" /> Arquivo Atual
                    </h3>
                    <button 
                        onClick={() => fetchData(true)} 
                        className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors"
                        title="Verificar atualização no servidor"
                    >
                        <RefreshCw size={12} /> Atualizar
                    </button>
                </div>
                
                {loading && !currentFile ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : currentFile ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4 relative group animate-in fade-in">
                        <div className="absolute top-2 right-2">
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded border border-green-100 text-green-600">
                                <FileText size={24} />
                            </div>
                            <div className="flex-grow min-w-0 pr-4">
                                <p className="text-sm font-bold text-green-900 truncate" title={currentFile.name}>{currentFile.name}</p>
                                <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                                    <Calendar size={10} /> 
                                    {new Date(currentFile.updated_at).toLocaleDateString()} às {new Date(currentFile.updated_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <a 
                                href={currentFile.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-white border border-green-200 text-green-700 text-xs font-bold py-2 rounded hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye size={14} /> Ver Arquivo
                            </a>
                            <a 
                                href={`/${region}/anuncie`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={14} /> Testar
                            </a>
                        </div>
                        <button 
                            onClick={handleRemoveFile}
                            className="w-full mt-2 text-[10px] text-red-500 hover:text-red-700 hover:underline text-center"
                        >
                            Remover este arquivo
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 text-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                            <UploadCloud size={24} />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhum Mídia Kit configurado.</p>
                        <p className="text-xs text-gray-400 mt-1">Faça o upload abaixo para ativar.</p>
                    </div>
                )}

                {/* Área de Upload */}
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".pdf,.pptx,.ppt" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        id="mk-upload" 
                        disabled={uploading} 
                        ref={fileInputRef}
                    />
                    <label 
                        htmlFor="mk-upload" 
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all group relative overflow-hidden",
                            uploading ? "bg-gray-50 border-gray-300 cursor-not-allowed" : 
                            uploadError ? "bg-red-50 border-red-300 hover:bg-red-100" :
                            "bg-white border-gray-300 hover:bg-gray-50 hover:border-primary"
                        )}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <Loader2 className="animate-spin text-primary mb-2" size={24} />
                                <span className="text-xs font-bold text-gray-500">Enviando e Salvando...</span>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className={clsx("mb-2 transition-transform group-hover:scale-110", uploadError ? "text-red-400" : "text-gray-400")} size={24} />
                                <span className={clsx("text-sm font-medium", uploadError ? "text-red-600" : "text-gray-600")}>
                                    {currentFile ? 'Substituir Arquivo' : 'Enviar Arquivo'}
                                </span>
                                <span className={clsx("text-xs mt-1", uploadError ? "text-red-400" : "text-gray-400")}>
                                    PDF ou PPTX (Max 50MB)
                                </span>
                            </>
                        )}
                    </label>
                </div>
                
                {uploadError && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 animate-in slide-in-from-top-1">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Total de Downloads</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{leads.length}</span>
                    <span className="text-xs text-gray-500">interessados</span>
                </div>
            </div>
        </div>

        {/* Coluna Direita: Lista de Leads */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Download size={20} className="text-primary" /> Histórico de Downloads ({region.toUpperCase()})
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
                            {loading && leads.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Carregando...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan={3} className="p-12 text-center text-gray-500">Nenhum download registrado ainda.</td></tr>
                            ) : (
                                filteredLeads.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
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
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaKit;
