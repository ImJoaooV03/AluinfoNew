import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, UploadCloud, Trash2, FileText, User, Tag, Layout, Users } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import { useCategories } from '../../hooks/useCategories';
import clsx from 'clsx';

const EventEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { addToast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories('event');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    organizer: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    capacity: '',
    link_url: '',
    image_url: '',
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
        fetchEvent();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
          // Formatar datas para datetime-local (YYYY-MM-DDTHH:mm)
          const formattedDate = data.event_date ? new Date(data.event_date).toISOString().slice(0, 16) : '';
          const formattedEndDate = data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '';
          
          setFormData({ 
              ...data,
              event_date: formattedDate,
              end_date: formattedEndDate,
              capacity: data.capacity || ''
          });
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro ao carregar evento.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_event_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingImage(true);
    try {
      // Tenta bucket específico, senão usa genérico
      const { error: uploadError } = await supabase.storage.from('event-images').upload(fileName, file);
      
      if (uploadError) {
          const { error: fallbackError } = await supabase.storage.from('news-images').upload(fileName, file);
          if (fallbackError) throw fallbackError;
          const { data } = supabase.storage.from('news-images').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      } else {
          const { data } = supabase.storage.from('event-images').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      }
      
      addToast('success', 'Imagem do evento enviada!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro no upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.event_date) {
        addToast('error', 'Título e Data de Início são obrigatórios.');
        return;
    }

    setLoading(true);
    try {
      const payload = { 
          ...formData, 
          event_date: new Date(formData.event_date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          region: isEditing ? formData.region : region, 
          updated_at: new Date().toISOString() 
      };
      
      if (isEditing) {
        const { error } = await supabase.from('events').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast('success', 'Evento salvo com sucesso!');
      navigate(`/${region}/admin/events`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro ao salvar evento.');
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
                <button type="button" onClick={() => navigate(`/${region}/admin/events`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`/${region}/admin/events`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-sm">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Calendar size={16} /> Informações Principais
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome do Evento <span className="text-red-500">*</span></label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: ExpoAlumínio 2025" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                                <option value="">Selecione...</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            {categories.length === 0 && !categoriesLoading && (
                                <p className="text-[10px] text-red-500 mt-1">Nenhuma categoria encontrada.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><User size={14} /> Organizador</label>
                            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: ABAL" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><FileText size={14} /> Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Sobre o evento, programação, destaques..." />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <MapPin size={16} /> Localização & Link
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Local do Evento</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: São Paulo Expo, SP" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Users size={14} /> Capacidade</label>
                            <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: 500 pessoas" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><LinkIcon size={14} /> Link Oficial (Inscrição/Site)</label>
                        <input type="url" name="link_url" value={formData.link_url} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://..." />
                    </div>
                </div>
            </div>

            {/* Right Column: Date, Status & Media */}
            <div className="space-y-6">
                
                {/* Date & Status */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Layout size={16} /> Configuração
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data de Início <span className="text-red-500">*</span></label>
                        <input 
                            type="datetime-local" 
                            name="event_date" 
                            value={formData.event_date} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data de Término</label>
                        <input 
                            type="datetime-local" 
                            name="end_date" 
                            value={formData.end_date} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                            <option value="active">Ativo (Visível)</option>
                            <option value="inactive">Inativo (Oculto)</option>
                        </select>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Banner do Evento
                    </h3>
                    <div className="relative">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={uploadingImage} />
                        <label htmlFor="image-upload" className={clsx("flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingImage && "opacity-50 cursor-not-allowed")}>
                            {uploadingImage ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : formData.image_url ? (
                                <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <>
                                    <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="text-sm font-medium text-gray-600">Enviar Imagem</span>
                                    <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
                                </>
                            )}
                        </label>
                    </div>
                    {formData.image_url && (
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} 
                            className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} /> Remover Imagem
                        </button>
                    )}
                </div>
            </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EventEditor;
