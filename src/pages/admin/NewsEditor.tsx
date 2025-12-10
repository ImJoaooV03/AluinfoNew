import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, AlertCircle, Calendar, User, Tag, FileText, AlignLeft, Info, UploadCloud, Bold, Italic, Heading, List, Link as LinkIcon, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';

// Interface estrita alinhada com o banco de dados
interface NewsPayload {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  status: string;
  publish_date: string;
  is_highlight: boolean;
  views?: number;
}

const NewsEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { categories, loading: categoriesLoading } = useCategories('news');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form States
  const [formData, setFormData] = useState<NewsPayload>({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    category: '', // Inicialmente vazio, aguardando carregamento ou seleção
    author: '',
    image_url: '',
    status: 'draft',
    publish_date: new Date().toISOString().split('T')[0],
    is_highlight: false
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  // Define categoria padrão assim que as categorias carregarem, se for uma nova notícia
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
          image_url: data.image_url || '',
          status: data.status || 'draft',
          publish_date: data.publish_date ? data.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
          is_highlight: data.is_highlight || false
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar artigo:', err);
      setError('Falha ao carregar dados do artigo.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload da imagem. Verifique se o arquivo é válido.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper to insert tags into textarea
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
        case 'bold':
            newText = `${before}<strong>${selection || 'Texto em negrito'}</strong>${after}`;
            break;
        case 'italic':
            newText = `${before}<em>${selection || 'Texto itálico'}</em>${after}`;
            break;
        case 'h3':
            newText = `${before}<h3>${selection || 'Subtítulo'}</h3>${after}`;
            break;
        case 'p':
            newText = `${before}<p>${selection || 'Novo parágrafo'}</p>${after}`;
            break;
        case 'ul':
            newText = `${before}<ul>\n  <li>${selection || 'Item da lista'}</li>\n</ul>${after}`;
            break;
        default:
            newText = text;
    }

    setFormData(prev => ({ ...prev, content: newText }));
    
    // Restore focus
    setTimeout(() => {
        textareaRef.current?.focus();
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: NewsPayload = {
        ...formData,
      };

      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('news')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('news')
          .insert([{ ...payload, views: 0 }]);
        error = insertError;
      }

      if (error) throw error;

      navigate('/admin/content');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      
      if (err.code === 'PGRST204') {
        setError(
          'Erro de Sincronização (PGRST204): O Supabase não reconhece algumas colunas. ' +
          'Ação necessária: Vá ao Painel Supabase > Configurações > API > "Reload schema cache".'
        );
      } else if (err.message) {
        setError(`Erro: ${err.message}`);
      } else {
        setError('Erro desconhecido ao salvar publicação.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/admin/content')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize as informações da notícia abaixo.' : 'Preencha os campos para publicar uma nova notícia.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/content')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || uploadingImage}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm flex-1 md:flex-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Notícia
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Informações Principais
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título da Notícia</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: Mercado de alumínio cresce 15%..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtítulo (Opcional)</label>
                <input 
                  type="text" 
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Uma breve linha de apoio ao título..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resumo</label>
                <textarea 
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Um parágrafo curto que resume a notícia..."
                  required
                />
              </div>
            </div>

            {/* Content Editor Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <AlignLeft size={20} className="text-primary" />
                Corpo da Notícia
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Conteúdo
                </label>
                
                {/* Simple Toolbar */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 border-b-0 rounded-t-md p-2">
                    <button type="button" onClick={() => insertTag('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Negrito"><Bold size={16} /></button>
                    <button type="button" onClick={() => insertTag('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Itálico"><Italic size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => insertTag('h3')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Subtítulo"><Heading size={16} /></button>
                    <button type="button" onClick={() => insertTag('p')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Parágrafo"><span className="font-serif font-bold text-sm px-1">P</span></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => insertTag('ul')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Lista"><List size={16} /></button>
                </div>

                <textarea 
                  ref={textareaRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono text-sm leading-relaxed"
                  placeholder="Escreva o conteúdo da sua notícia aqui..."
                  required
                />
              </div>
            </div>

          </div>

          {/* Right Column - Settings & Meta */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Publicação</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="draft">Rascunho (Oculto)</option>
                  <option value="published">Publicado (Visível)</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Data de Publicação
                </label>
                <input 
                  type="date" 
                  name="publish_date"
                  value={formData.publish_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                <input 
                  type="checkbox" 
                  id="is_highlight"
                  name="is_highlight"
                  checked={formData.is_highlight}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_highlight" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Destacar na Home
                </label>
              </div>
            </div>

            {/* Categorization Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Categorização</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-2">
                  <Tag size={14} /> Categoria
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  disabled={categoriesLoading}
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-2">
                  <User size={14} /> Autor
                </label>
                <input 
                  type="text" 
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Nome do autor"
                  required
                />
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" /> Mídia
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Imagem de Capa</label>
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                    />
                    <label 
                        htmlFor="image-upload"
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                            uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        )}
                    >
                        {uploadingImage ? (
                            <div className="flex flex-col items-center text-gray-500">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <span className="text-xs">Enviando...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <UploadCloud className="mb-2" size={24} />
                                <span className="text-xs font-bold">Clique para enviar</span>
                            </div>
                        )}
                    </label>
                </div>
              </div>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50 relative group">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
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

export default NewsEditor;
