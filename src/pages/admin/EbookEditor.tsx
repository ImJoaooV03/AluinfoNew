import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, AlertCircle, Book, UploadCloud, Image as ImageIcon, Trash2, FileText, DollarSign, User } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';

const EbookEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { categories, loading: categoriesLoading } = useCategories('ebook');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: 0,
    description: '',
    category: '',
    file_url: '',
    cover_url: '',
    status: 'draft',
    downloads: 0
  });

  useEffect(() => {
    if (isEditing) {
      fetchEbook();
    }
  }, [id]);

  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  const fetchEbook = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          author: data.author || '',
          price: data.price || 0,
          description: data.description || '',
          category: data.category || '',
          file_url: data.file_url || '',
          cover_url: data.cover_url || '',
          status: data.status || 'draft',
          downloads: data.downloads || 0
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar ebook:', err);
      setError('Falha ao carregar dados.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload de Arquivo (PDF/EPUB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `ebook_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingFile(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('ebooks-files')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('ebooks-files')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, file_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar arquivo do ebook.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Upload de Capa (Imagem)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `cover_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingCover(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('ebooks-covers')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('ebooks-covers')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar capa.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, updated_at: new Date().toISOString() };
      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('ebooks')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ebooks')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;
      navigate('/admin/ebooks');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar ebook.');
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
              onClick={() => navigate('/admin/ebooks')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar E-book' : 'Novo E-book'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize as informações do livro.' : 'Cadastre um novo título na biblioteca.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/ebooks')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || uploadingFile || uploadingCover}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm flex-1 md:flex-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Book size={20} className="text-primary" />
                Dados do Livro
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título do E-book</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: Guia Completo de Fundição"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <User size={14} /> Autor
                    </label>
                    <input 
                    type="text" 
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Nome do Autor"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <DollarSign size={14} /> Preço (R$)
                    </label>
                    <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Deixe 0 para Gratuito.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição / Sinopse</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Sobre o que é este livro..."
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Arquivo do Livro
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                    type="file" 
                    accept=".pdf,.epub,.mobi"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingFile}
                />
                {uploadingFile ? (
                    <div className="flex flex-col items-center text-gray-500">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-xs">Enviando arquivo...</span>
                    </div>
                ) : formData.file_url ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                            <Book size={24} />
                        </div>
                        <span className="text-sm font-bold text-purple-700 mb-1">E-book Carregado!</span>
                        <span className="text-xs text-gray-500 break-all px-4">{formData.file_url.split('/').pop()}</span>
                        <span className="text-xs text-primary mt-2 font-bold">Clique para substituir</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UploadCloud className="mb-2" size={32} />
                        <span className="text-sm font-bold">Clique ou arraste o arquivo (PDF, EPUB)</span>
                    </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Configurações</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria</label>
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
            </div>

            {/* Cover Image */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" /> Capa do Livro
              </h3>
              
              <div className="relative">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                    disabled={uploadingCover}
                />
                <label 
                    htmlFor="cover-upload"
                    className={clsx(
                        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative",
                        uploadingCover ? "opacity-50 cursor-not-allowed" : ""
                    )}
                >
                    {uploadingCover ? (
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                    ) : formData.cover_url ? (
                        <img src={formData.cover_url} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-500">
                            <ImageIcon className="mb-2" size={24} />
                            <span className="text-xs">Enviar Capa</span>
                            <span className="text-[10px] text-gray-400 mt-1">Recomendado: Vertical (3:4)</span>
                        </div>
                    )}
                </label>
                {formData.cover_url && (
                    <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-sm"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EbookEditor;
