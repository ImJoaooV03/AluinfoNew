import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, UploadCloud, Image as ImageIcon, Book, Trash2, FileText, DollarSign, User, Layout, File } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

const EbookEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { categories, loading: categoriesLoading } = useCategories('ebook');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    pages: '',
    description: '',
    category: '', 
    file_url: '',
    cover_url: '',
    status: 'active',
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

  // Carrega dados se for edição
  useEffect(() => {
    if (isEditing) {
        fetchEbook();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchEbook = async () => {
    try {
      const { data, error } = await supabase.from('ebooks').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
          setFormData({
              ...data,
              price: data.price || '',
              pages: data.pages || ''
          });
      }
    } catch (err) { 
        console.error(err);
        addToast('error', 'Erro ao carregar e-book.');
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

    if (file.size > 50 * 1024 * 1024) {
        addToast('error', 'O arquivo deve ter no máximo 50MB.');
        return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_ebook_file_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingFile(true);
    try {
      const { error } = await supabase.storage.from('ebooks-files').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('ebooks-files').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, file_url: data.publicUrl }));
      addToast('success', 'Arquivo do E-book enviado!');
    } catch (err: any) { 
        console.error(err);
        if (err.statusCode === '413') {
            addToast('error', 'Arquivo muito grande (Max 50MB).');
        } else {
            addToast('error', 'Erro no upload do arquivo.'); 
        }
    } finally { 
        setUploadingFile(false); 
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
        addToast('error', 'A capa deve ter no máximo 5MB.');
        return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_ebook_cover_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingCover(true);
    try {
      const { error } = await supabase.storage.from('ebooks-covers').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('ebooks-covers').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, cover_url: data.publicUrl }));
      addToast('success', 'Capa enviada com sucesso!');
    } catch (err: any) { 
        console.error(err);
        if (err.statusCode === '413') {
            addToast('error', 'Imagem muito grande (Max 5MB).');
        } else {
            addToast('error', 'Erro no upload da capa.'); 
        }
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

    setLoading(true);
    try {
      const payload = { 
          ...formData, 
          price: formData.price ? parseFloat(formData.price.toString()) : 0,
          pages: formData.pages ? parseInt(formData.pages.toString()) : null,
          region: isEditing ? formData.region : region, 
          updated_at: new Date().toISOString() 
      };
      
      if (isEditing) {
        const { error } = await supabase.from('ebooks').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ebooks').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast('success', 'E-book salvo com sucesso!');
      navigate(`/${region}/admin/ebooks`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro ao salvar e-book.');
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
                <button type="button" onClick={() => navigate(`/${region}/admin/ebooks`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar E-book' : 'Novo E-book'}</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`/${region}/admin/ebooks`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
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
                        <Book size={16} /> Informações do Livro
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título do E-book <span className="text-red-500">*</span></label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: Fundição sob Pressão Avançada" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><User size={14} /> Autor</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Nome do Autor" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><FileText size={14} /> Nº de Páginas</label>
                            <input type="number" name="pages" value={formData.pages} onChange={handleChange} min="1" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: 120" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Sinopse / Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Sobre o que é este livro..." />
                    </div>
                </div>

                {/* File Upload */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <File size={16} /> Arquivo Digital (PDF/EPUB)
                    </h3>
                    <div className="relative">
                        <input type="file" accept=".pdf,.epub" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploadingFile} />
                        <label htmlFor="file-upload" className={clsx("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingFile && "opacity-50 cursor-not-allowed")}>
                            {uploadingFile ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : (
                                <>
                                    <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="text-sm font-medium text-gray-600">Clique para enviar o arquivo</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF ou EPUB (Max 50MB)</span>
                                </>
                            )}
                        </label>
                    </div>
                    {formData.file_url && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg animate-in fade-in">
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium truncate">
                                <FileText size={16} />
                                <span className="truncate">Arquivo anexado com sucesso</span>
                            </div>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, file_url: '' }))} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
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
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><DollarSign size={14} /> Preço (0 para Grátis)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
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
                        <ImageIcon size={16} /> Capa do Livro
                    </h3>
                    <div className="relative">
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-upload" disabled={uploadingCover} />
                        <label htmlFor="cover-upload" className={clsx("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingCover && "opacity-50 cursor-not-allowed")}>
                            {uploadingCover ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : formData.cover_url ? (
                                <img src={formData.cover_url} alt="Capa Preview" className="h-full w-full object-cover rounded-lg" />
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
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))} 
                            className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} /> Remover Capa
                        </button>
                    )}
                </div>
            </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EbookEditor;
