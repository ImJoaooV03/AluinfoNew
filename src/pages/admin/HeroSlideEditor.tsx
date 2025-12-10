import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, UploadCloud, Trash2, Layout, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

const HeroSlideEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '', // Optional subtitle
    image_url: '',
    link_url: '',
    display_order: 1,
    status: 'active'
  });

  useEffect(() => {
    if (isEditing) {
      fetchSlide();
    } else {
        // Fetch max order to auto-increment
        fetchMaxOrder();
    }
  }, [id]);

  const fetchMaxOrder = async () => {
      try {
          const { data } = await supabase.from('hero_slides').select('display_order').order('display_order', { ascending: false }).limit(1);
          if (data && data.length > 0) {
              setFormData(prev => ({ ...prev, display_order: data[0].display_order + 1 }));
          }
          setFetching(false);
      } catch (e) {
          setFetching(false);
      }
  };

  const fetchSlide = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          image_url: data.image_url || '',
          link_url: data.link_url || '',
          display_order: data.display_order || 1,
          status: data.status || 'active'
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar slide:', err);
      setError('Falha ao carregar dados do slide.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `hero_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);
    setError(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from('hero-slides')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-slides')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('hero_slides')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;

      navigate('/admin/hero');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar slide.');
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
              onClick={() => navigate('/admin/hero')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Slide' : 'Novo Slide'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize o banner do carrossel.' : 'Adicione um novo destaque na Home.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/hero')}
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
          
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Preview Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-2 flex items-center gap-2">
                    <Layout size={20} className="text-primary" />
                    Pré-visualização (Live)
                </h3>
                
                {/* The Preview Container - CLEAN VERSION (Image Only) */}
                <div className="w-full aspect-[3/1] bg-gray-100 relative overflow-hidden rounded-sm group border border-gray-200">
                    {formData.image_url ? (
                        <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <ImageIcon size={48} />
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                    * A imagem será exibida exatamente como está, sem textos ou filtros sobrepostos.
                </p>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
                Conteúdo
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título (Apenas para controle interno)</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="EX: BANNER PRINCIPAL"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">Este texto não aparecerá na imagem.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                    <LinkIcon size={14} /> Link de Destino
                </label>
                <input 
                  type="url" 
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

          </div>

          {/* Right Column - Image & Settings */}
          <div className="space-y-6">
            
            {/* Image Upload */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                Imagem de Fundo
              </h3>
              
              <div className="relative">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hero-upload"
                    disabled={uploadingImage}
                />
                <label 
                    htmlFor="hero-upload"
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
                            <span className="text-[10px] text-gray-400 mt-1">Recomendado: 1920x600px</span>
                        </div>
                    )}
                </label>
              </div>

              {formData.image_url && (
                  <div className="relative mt-2">
                      <p className="text-xs text-gray-500 truncate mb-1">URL Atual:</p>
                      <input 
                        type="text" 
                        value={formData.image_url} 
                        readOnly 
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded text-gray-500"
                      />
                  </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Configurações</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ordem de Exibição</label>
                <input 
                  type="number" 
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default HeroSlideEditor;
