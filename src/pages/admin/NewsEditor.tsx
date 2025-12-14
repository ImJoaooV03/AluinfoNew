import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, FileText, AlignLeft, UploadCloud, Bold, Italic, Heading, List, Trash2, Plus, User, Clock, Tag, X, Star, Layout } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';

interface NewsPayload {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  author_role: string;
  author_avatar: string;
  read_time: string;
  tags: string[];
  image_url: string;
  status: string;
  publish_date: string;
  is_highlight: boolean;
  region: string;
}

const NewsEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { categories, loading: categoriesLoading } = useCategories('news');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Form States
  const [formData, setFormData] = useState<NewsPayload>({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    category: '', 
    author: '',
    author_role: '',
    author_avatar: '',
    read_time: '',
    tags: [],
    image_url: '',
    status: 'draft',
    publish_date: new Date().toISOString().split('T')[0],
    is_highlight: false,
    region: region
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Garante a região correta ao criar novo
  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region: region }));
    }
  }, [region, isEditing]);

  // Carregar dados se for edição
  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    } else {
      setFetching(false);
    }
  }, [id]);

  // Pré-selecionar categoria
  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          summary: data.summary || '',
          content: data.content || '',
          category: data.category || '',
          author: data.author || '',
          author_role: data.author_role || '',
          author_avatar: data.author_avatar || '',
          read_time: data.read_time || '',
          tags: data.tags || [],
          image_url: data.image_url || '',
          status: data.status || 'draft',
          publish_date: data.publish_date ? data.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
          is_highlight: data.is_highlight || false,
          region: data.region
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar artigo:', err);
      addToast('error', 'Erro ao carregar notícia.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // 2MB limit for news images/avatars
    if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'A imagem deve ter no máximo 2MB.');
        return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_${type}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    if (type === 'cover') setUploadingImage(true);
    else setUploadingAvatar(true);

    try {
      const bucket = type === 'cover' ? 'news-images' : 'avatars'; 
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, author_avatar: publicUrl }));
      }
      addToast('success', 'Imagem enviada com sucesso!');
    } catch (err: any) {
      console.error('Erro no upload:', err);
      if (err.statusCode === '413') {
        addToast('error', 'Imagem muito grande. Limite de 2MB.');
      } else {
        addToast('error', 'Erro ao fazer upload.');
      }
    } finally {
      if (type === 'cover') setUploadingImage(false);
      else setUploadingAvatar(false);
    }
  };

  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    let newText = '';
    
    switch(tag) {
        case 'bold': newText = `${before}<strong>${selection || 'Texto em negrito'}</strong>${after}`; break;
        case 'italic': newText = `${before}<em>${selection || 'Texto em itálico'}</em>${after}`; break;
        case 'h3': newText = `${before}<h3>${selection || 'Subtítulo'}</h3>${after}`; break;
        case 'p': newText = `${before}<p>${selection || 'Parágrafo'}</p>${after}`; break;
        case 'ul': newText = `${before}<ul>\n  <li>${selection || 'Item da lista'}</li>\n</ul>${after}`; break;
        case 'blockquote': newText = `${before}<blockquote>${selection || 'Citação'}</blockquote>${after}`; break;
        default: newText = text;
    }
    
    setFormData(prev => ({ ...prev, content: newText }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
        addToast('error', 'Selecione uma categoria.');
        return;
    }

    if (!formData.title) {
        addToast('error', 'O título é obrigatório.');
        return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        author: formData.author,
        author_role: formData.author_role,
        author_avatar: formData.author_avatar,
        read_time: formData.read_time,
        tags: formData.tags,
        image_url: formData.image_url,
        status: formData.status,
        publish_date: formData.publish_date,
        is_highlight: formData.is_highlight,
        region: isEditing ? formData.region : region,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('news')
          .update(payload)
          .eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('news')
          .insert([{ ...payload, views: 0, created_at: new Date().toISOString() }]);
        if (insertError) throw insertError;
      }

      addToast('success', isEditing ? 'Notícia atualizada!' : 'Notícia criada!');
      navigate(`/${region}/admin/content`);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      // Tratamento específico para erro de cache de schema (PGRST204)
      if (err.code === 'PGRST204' || (err.message && err.message.includes('updated_at'))) {
         addToast('error', '⚠️ Erro de Cache do Supabase: Vá em Settings > API > Reload Schema Cache no painel do Supabase.');
      } else {
         addToast('error', 'Erro ao salvar publicação: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <AdminLayout><div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(`/${region}/admin/content`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(`/${region}/admin/content`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
            <button type="submit" disabled={loading || uploadingImage} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-sm">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <FileText size={16} /> Conteúdo Principal
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título da Notícia <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg font-bold text-gray-800 placeholder-gray-300" required placeholder="Digite um título impactante..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Subtítulo (Linha Fina)</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Complemento do título..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Resumo <span className="text-red-500">*</span></label>
                <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" required placeholder="Breve descrição que aparecerá nos cards e resultados de busca..." />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <AlignLeft size={16} /> Corpo da Notícia
              </h3>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-300 p-2 flex-wrap">
                    <button type="button" onClick={() => insertTag('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Negrito"><Bold size={16} /></button>
                    <button type="button" onClick={() => insertTag('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Itálico"><Italic size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => insertTag('h3')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Subtítulo"><Heading size={16} /></button>
                    <button type="button" onClick={() => insertTag('p')} className="p-1.5 hover:bg-gray-200 rounded font-serif font-bold text-sm px-2 text-gray-700" title="Parágrafo">P</button>
                    <button type="button" onClick={() => insertTag('blockquote')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Citação">""</button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => insertTag('ul')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Lista"><List size={16} /></button>
                </div>
                <textarea 
                    ref={textareaRef} 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange} 
                    rows={20} 
                    className="w-full px-4 py-3 border-none focus:ring-0 font-mono text-sm leading-relaxed" 
                    required 
                    placeholder="Escreva o conteúdo aqui. Use a barra acima para formatar."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Meta */}
          <div className="space-y-6">
            
            {/* Publication Settings */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <Layout size={16} /> Publicação
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white">
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="scheduled">Agendado</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase">Categoria</label>
                        <button type="button" onClick={() => navigate(`/${region}/admin/categories`)} className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold"><Plus size={10} /> NOVA</button>
                    </div>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white" disabled={categoriesLoading}>
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data de Publicação</label>
                    <input type="date" name="publish_date" value={formData.publish_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_highlight" checked={formData.is_highlight} onChange={(e) => setFormData(prev => ({ ...prev, is_highlight: e.target.checked }))} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800 flex items-center gap-1"><Star size={14} className="text-orange-500 fill-orange-500" /> Destaque Principal</span>
                        <span className="block text-xs text-gray-500">Exibir no carrossel ou topo da home</span>
                    </div>
                </label>
              </div>
            </div>

            {/* Author & Meta */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                    <User size={16} /> Autor & Detalhes
                </h3>
                
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative group cursor-pointer">
                            {formData.author_avatar ? (
                                <img src={formData.author_avatar} alt="Autor" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={uploadingAvatar} />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingAvatar ? <Loader2 size={16} className="text-white animate-spin" /> : <Plus size={16} className="text-white" />}
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-500 mt-1">Foto</p>
                    </div>
                    <div className="flex-grow space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Ex: João Silva" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cargo</label>
                            <input type="text" name="author_role" value={formData.author_role} onChange={handleChange} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Ex: Editor Chefe" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Clock size={14} /> Tempo de Leitura</label>
                    <input type="text" name="read_time" value={formData.read_time} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Ex: 5 min" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Tag size={14} /> Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1 border border-gray-200">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                    <input 
                        type="text" 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)} 
                        onKeyDown={handleAddTag}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Digite e Enter..." 
                    />
                </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> Imagem de Capa
              </h3>
              
              {formData.image_url ? (
                <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                  <img src={formData.image_url} alt="Capa" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <label className="p-2 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer text-white transition-colors">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" disabled={uploadingImage} />
                        <ImageIcon size={20} />
                     </label>
                     <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors">
                        <Trash2 size={20} />
                     </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" id="cover-upload" disabled={uploadingImage} />
                    <label htmlFor="cover-upload" className={clsx("flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingImage && "opacity-50 cursor-not-allowed")}>
                        {uploadingImage ? (
                            <Loader2 className="animate-spin text-primary" size={24} />
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="text-gray-400" size={24} />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Clique para enviar</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
                            </>
                        )}
                    </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default NewsEditor;
