import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, UploadCloud, Image as ImageIcon, Paperclip, Trash2, FileText, User, Calendar, Link as LinkIcon, Layout } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

const TechnicalMaterialEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { categories, loading: categoriesLoading } = useCategories('technical');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    author: '',
    publish_date: new Date().toISOString().slice(0, 16), // datetime-local format
    file_url: '',
    link_url: '',
    cover_url: '',
    status: 'published',
    region: region
  });

  // Garante a região correta ao criar novo
  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region }));
    }
  }, [region, isEditing]);

  // Pré-selecionar categoria
  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  useEffect(() => {
    if (isEditing) {
        fetchMaterial();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const { data, error } = await supabase.from('technical_materials').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
          setFormData({
              ...data,
              publish_date: data.publish_date ? new Date(data.publish_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
              link_url: data.link_url || '',
              author: data.author || ''
          });
      }
    } catch (err) { 
        console.error(err);
        addToast('error', 'Erro ao carregar material.');
    } finally { 
        setFetching(false); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_tech_file_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingFile(true);
    try {
      const { error } = await supabase.storage.from('technical-materials').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('technical-materials').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, file_url: data.publicUrl, link_url: '' })); // Limpa link externo se fizer upload
      addToast('success', 'Arquivo enviado com sucesso!');
    } catch (err) { 
        console.error(err);
        addToast('error', 'Erro no upload do arquivo.'); 
    } finally { 
        setUploadingFile(false); 
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_tech_cover_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingCover(true);
    try {
      const { error } = await supabase.storage.from('technical-covers').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('technical-covers').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, cover_url: data.publicUrl }));
      addToast('success', 'Capa enviada com sucesso!');
    } catch (err) { 
        console.error(err);
        addToast('error', 'Erro no upload da capa.'); 
    } finally { 
        setUploadingCover(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
        addToast('error', 'Título e Categoria são obrigatórios.');
        return;
    }

    if (!formData.file_url && !formData.link_url) {
        addToast('error', 'Você deve fornecer um Arquivo ou um Link Externo.');
        return;
    }

    setLoading(true);
    try {
      const payload = { 
          ...formData, 
          publish_date: new Date(formData.publish_date).toISOString(),
          region: isEditing ? formData.region : region, 
          updated_at: new Date().toISOString() 
      };
      
      if (isEditing) {
        const { error } = await supabase.from('technical_materials').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('technical_materials').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast('success', 'Material salvo com sucesso!');
      navigate(`/${region}/admin/materials`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro ao salvar material.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <AdminLayout><div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate(`/${region}/admin/materials`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Material' : 'Novo Material'}</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`/${region}/admin/materials`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-sm">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <FileText size={16} /> Informações Básicas
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título do Material <span className="text-red-500">*</span></label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: Guia de Ligas 2025" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><User size={14} /> Autor / Fonte</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: ABNT, Magma" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Calendar size={14} /> Data de Publicação</label>
                            <input type="datetime-local" name="publish_date" value={formData.publish_date} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição / Resumo</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Breve resumo do conteúdo..." />
                    </div>
                </div>

                {/* File Upload / Link */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Paperclip size={16} /> Arquivo ou Link
                    </h3>
                    
                    {/* Option 1: File Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Upload de Arquivo (PDF/DOC)</label>
                        <div className="relative">
                            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploadingFile} />
                            <label htmlFor="file-upload" className={clsx("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingFile && "opacity-50 cursor-not-allowed")}>
                                {uploadingFile ? (
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                ) : (
                                    <>
                                        <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                                        <span className="text-sm font-medium text-gray-600">Clique para enviar arquivo</span>
                                        <span className="text-xs text-gray-400 mt-1">PDF, DOC, XLS (Max 50MB)</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {formData.file_url && (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg mt-3 animate-in fade-in">
                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium truncate">
                                    <Paperclip size={16} />
                                    <span className="truncate">Arquivo anexado</span>
                                </div>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, file_url: '' }))} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OU</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Option 2: External Link */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><LinkIcon size={14} /> Link Externo</label>
                        <input 
                            type="url" 
                            name="link_url" 
                            value={formData.link_url} 
                            onChange={(e) => {
                                handleChange(e);
                                if (e.target.value) setFormData(prev => ({ ...prev, file_url: '' })); // Limpa arquivo se usar link
                            }} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                            placeholder="https://..." 
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Use esta opção se o material estiver hospedado em outro site (ex: Drive, Dropbox).</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Settings & Cover */}
            <div className="space-y-6">
                {/* Publishing */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Layout size={16} /> Configuração
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria <span className="text-red-500">*</span></label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" required>
                            <option value="">Selecione...</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        {categories.length === 0 && !categoriesLoading && (
                            <p className="text-[10px] text-red-500 mt-1">Nenhuma categoria encontrada.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicado</option>
                            <option value="archived">Arquivado</option>
                        </select>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Capa do Material
                    </h3>
                    <div className="relative">
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-upload" disabled={uploadingCover} />
                        <label htmlFor="cover-upload" className={clsx("flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingCover && "opacity-50 cursor-not-allowed")}>
                            {uploadingCover ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : (
                                <>
                                    <ImageIcon className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="text-sm font-medium text-gray-600">Enviar Capa</span>
                                    <span className="text-xs text-gray-400 mt-1">Recomendado: Vertical</span>
                                </>
                            )}
                        </label>
                    </div>
                    {formData.cover_url && (
                        <div className="mt-4 relative group rounded-lg overflow-hidden border border-gray-200 aspect-[3/4] bg-gray-50">
                            <img src={formData.cover_url} alt="Capa Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))} 
                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default TechnicalMaterialEditor;
