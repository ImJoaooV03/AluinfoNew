import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, AlertCircle, FileText, UploadCloud, Image as ImageIcon, Trash2, Bold, Italic, Heading, List, Paperclip } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';

const TechnicalMaterialEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { categories, loading: categoriesLoading } = useCategories('technical');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    file_url: '',
    cover_url: '',
    status: 'draft',
    downloads: 0
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      fetchMaterial();
    }
  }, [id]);

  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  const fetchMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          category: data.category || '',
          file_url: data.file_url || '',
          cover_url: data.cover_url || '',
          status: data.status || 'draft',
          downloads: data.downloads || 0
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar material:', err);
      setError('Falha ao carregar dados.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload de Arquivo (PDF/DOC)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `doc_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingFile(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('materials-files')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('materials-files')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, file_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar arquivo.');
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
        .from('materials-covers')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('materials-covers')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploadingCover(false);
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
        case 'bold': newText = `${before}<strong>${selection || 'Negrito'}</strong>${after}`; break;
        case 'italic': newText = `${before}<em>${selection || 'Itálico'}</em>${after}`; break;
        case 'h3': newText = `${before}<h3>${selection || 'Subtítulo'}</h3>${after}`; break;
        case 'ul': newText = `${before}<ul>\n  <li>${selection || 'Item'}</li>\n</ul>${after}`; break;
        default: newText = text;
    }
    setFormData(prev => ({ ...prev, content: newText }));
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
          .from('technical_materials')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('technical_materials')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;
      navigate('/admin/materials');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar material.');
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
              onClick={() => navigate('/admin/materials')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Material' : 'Novo Material Técnico'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize as informações do documento.' : 'Cadastre um novo manual ou norma.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/materials')}
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
                <FileText size={20} className="text-primary" />
                Informações do Material
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: Guia de Normas ABNT 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição Curta</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Breve resumo do conteúdo..."
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Conteúdo Detalhado</label>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 border-b-0 rounded-t-md p-2">
                    <button type="button" onClick={() => insertTag('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Negrito"><Bold size={16} /></button>
                    <button type="button" onClick={() => insertTag('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Itálico"><Italic size={16} /></button>
                    <button type="button" onClick={() => insertTag('h3')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Subtítulo"><Heading size={16} /></button>
                    <button type="button" onClick={() => insertTag('ul')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Lista"><List size={16} /></button>
                </div>
                <textarea 
                  ref={textareaRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono text-sm leading-relaxed"
                  placeholder="Descrição completa, tópicos abordados, etc..."
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Paperclip size={20} className="text-primary" />
                Arquivo para Download
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
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
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                            <FileText size={24} />
                        </div>
                        <span className="text-sm font-bold text-green-700 mb-1">Arquivo Anexado!</span>
                        <span className="text-xs text-gray-500 break-all px-4">{formData.file_url.split('/').pop()}</span>
                        <span className="text-xs text-primary mt-2 font-bold">Clique para substituir</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UploadCloud className="mb-2" size={32} />
                        <span className="text-sm font-bold">Clique ou arraste o arquivo (PDF, DOC)</span>
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
                <ImageIcon size={20} className="text-primary" /> Imagem de Capa
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
                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative",
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

export default TechnicalMaterialEditor;
