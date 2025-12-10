import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, AlertCircle, Factory, MapPin, Globe, Mail, Phone, ShieldCheck, UploadCloud, Image as ImageIcon, Trash2, Plus, X, Layers, MessageSquare, BarChart3, Info } from 'lucide-react';
import clsx from 'clsx';

interface Capability {
  id?: string;
  tempId?: string;
  title: string;
  description: string;
}

interface GalleryImage {
  id?: string;
  tempId?: string;
  image_url: string;
  file?: File; // Para upload
}

const FoundryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  
  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    category: 'Injeção sob Pressão',
    description: '',
    phone: '',
    email: '',
    whatsapp: '',
    location: '',
    website: '',
    logo_url: '',
    status: 'active',
    is_verified: false,
    rating: 0,
    // Métricas
    certification: '',
    years_experience: '',
    monthly_capacity: '',
    market_reach: ''
  });

  // Sub-resources
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [deletedCapabilityIds, setDeletedCapabilityIds] = useState<string[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);

  // Modal State
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [currentCap, setCurrentCap] = useState<Capability | null>(null);

  useEffect(() => {
    if (isEditing) {
      fetchFoundryData();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchFoundryData = async () => {
    try {
      // 1. Fetch Foundry
      const { data, error } = await supabase
        .from('foundries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || 'Injeção sob Pressão',
          description: data.description || '',
          phone: data.phone || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          location: data.location || '',
          website: data.website || '',
          logo_url: data.logo_url || '',
          status: data.status || 'active',
          is_verified: data.is_verified || false,
          rating: data.rating || 0,
          certification: data.certification || '',
          years_experience: data.years_experience || '',
          monthly_capacity: data.monthly_capacity || '',
          market_reach: data.market_reach || ''
        });
      }

      // 2. Fetch Capabilities
      const { data: capsData } = await supabase
        .from('foundry_capabilities')
        .select('*')
        .eq('foundry_id', id);
      
      if (capsData) setCapabilities(capsData);

      // 3. Fetch Gallery
      const { data: galleryData } = await supabase
        .from('foundry_gallery')
        .select('*')
        .eq('foundry_id', id);

      if (galleryData) setGallery(galleryData);

    } catch (err: any) {
      console.error('Erro ao buscar fundição:', err);
      setError('Falha ao carregar dados da fundição.');
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

  // --- Logo Upload ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingLogo(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('foundry-logos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('foundry-logos')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar logotipo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- Gallery Upload ---
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingGallery(true);
    const newImages: GalleryImage[] = [];

    try {
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `gallery_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('foundry-gallery')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('foundry-gallery')
                .getPublicUrl(fileName);

            newImages.push({
                tempId: Math.random().toString(36).substr(2, 9),
                image_url: publicUrl
            });
        }
        setGallery(prev => [...prev, ...newImages]);
    } catch (err) {
        console.error(err);
        alert('Erro ao enviar imagens da galeria. Verifique se o bucket "foundry-gallery" existe.');
    } finally {
        setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (img: GalleryImage) => {
    if (img.id) {
        setDeletedGalleryIds(prev => [...prev, img.id!]);
    }
    setGallery(prev => prev.filter(item => item !== img));
  };

  // --- Capabilities Logic ---
  const handleOpenCapModal = (cap?: Capability) => {
    if (cap) {
        setCurrentCap({ ...cap });
    } else {
        setCurrentCap({
            tempId: Math.random().toString(36).substr(2, 9),
            title: '',
            description: ''
        });
    }
    setIsCapModalOpen(true);
  };

  const handleSaveCap = () => {
    if (!currentCap || !currentCap.title) {
        alert("O título é obrigatório");
        return;
    }
    setCapabilities(prev => {
        const exists = prev.findIndex(c => (c.id && c.id === currentCap.id) || (c.tempId && c.tempId === currentCap.tempId));
        if (exists >= 0) {
            const updated = [...prev];
            updated[exists] = currentCap;
            return updated;
        }
        return [...prev, currentCap];
    });
    setIsCapModalOpen(false);
    setCurrentCap(null);
  };

  const handleDeleteCap = (cap: Capability) => {
    if (cap.id) setDeletedCapabilityIds(prev => [...prev, cap.id!]);
    setCapabilities(prev => prev.filter(c => c !== cap));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Save Foundry
      const payload = { ...formData, updated_at: new Date().toISOString() };
      let foundryId = id;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('foundries')
          .update(payload)
          .eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { data: newFoundry, error: insertError } = await supabase
          .from('foundries')
          .insert([{ ...payload, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (insertError) throw insertError;
        foundryId = newFoundry.id;
      }

      if (!foundryId) throw new Error("ID da fundição não encontrado.");

      // 2. Process Capabilities
      const capsToUpsert = capabilities.map(c => {
        const { tempId, ...rest } = c;
        return { ...rest, foundry_id: foundryId, updated_at: new Date().toISOString() };
      });
      if (capsToUpsert.length > 0) {
        const { error: capsError } = await supabase.from('foundry_capabilities').upsert(capsToUpsert);
        if (capsError) throw capsError;
      }
      if (deletedCapabilityIds.length > 0) {
        await supabase.from('foundry_capabilities').delete().in('id', deletedCapabilityIds);
      }

      // 3. Process Gallery
      const galleryToInsert = gallery
        .filter(g => !g.id) // Only new ones (ones with tempId)
        .map(g => ({ foundry_id: foundryId, image_url: g.image_url }));
      
      if (galleryToInsert.length > 0) {
        const { error: galleryError } = await supabase.from('foundry_gallery').insert(galleryToInsert);
        if (galleryError) throw galleryError;
      }
      if (deletedGalleryIds.length > 0) {
        await supabase.from('foundry_gallery').delete().in('id', deletedGalleryIds);
      }

      navigate('/admin/foundries');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar fundição.');
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
              onClick={() => navigate('/admin/foundries')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Fundição' : 'Nova Fundição'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize os dados da planta.' : 'Cadastre uma nova fundição no sistema.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/foundries')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || uploadingLogo || uploadingGallery}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm flex-1 md:flex-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Tudo
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
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Dados da Fundição */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Factory size={20} className="text-primary" />
                Dados da Fundição
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Fundição</label>
                    <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Processo Principal</label>
                    <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                    <option value="Injeção sob Pressão">Injeção sob Pressão</option>
                    <option value="Coquilha">Coquilha (Gravidade)</option>
                    <option value="Areia">Areia</option>
                    <option value="Microfusão">Microfusão</option>
                    <option value="Baixa Pressão">Baixa Pressão</option>
                    <option value="Artística">Artística</option>
                    <option value="Outros">Outros</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Avaliação (0-5)</label>
                    <input 
                    type="number" 
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Capacidades técnicas, ligas fundidas, setores atendidos..."
                />
              </div>
            </div>

            {/* Métricas e KPIs (NOVO) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Métricas e Indicadores
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Certificação</label>
                    <input 
                        type="text" 
                        name="certification"
                        value={formData.certification}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Ex: ISO 9001"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Anos de Experiência</label>
                    <input 
                        type="text" 
                        name="years_experience"
                        value={formData.years_experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Ex: 25+"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Capacidade/Mês</label>
                    <input 
                        type="text" 
                        name="monthly_capacity"
                        value={formData.monthly_capacity}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Ex: 500t"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Abrangência</label>
                    <input 
                        type="text" 
                        name="market_reach"
                        value={formData.market_reach}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Ex: Nacional, Global"
                    />
                </div>
              </div>
            </div>

            {/* Capacidades & Serviços */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Layers size={20} className="text-primary" />
                        Capacidades & Serviços
                    </h3>
                    <button 
                        type="button"
                        onClick={() => handleOpenCapModal()}
                        className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Plus size={14} /> Adicionar
                    </button>
                </div>

                {capabilities.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                        <Layers size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma capacidade cadastrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {capabilities.map((cap, index) => (
                            <div key={cap.id || cap.tempId || index} className="flex justify-between items-start p-3 bg-gray-50 rounded-md border border-gray-100 group hover:border-gray-300 transition-colors">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">{cap.title}</h4>
                                    <p className="text-xs text-gray-500">{cap.description}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        type="button"
                                        onClick={() => handleOpenCapModal(cap)} 
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteCap(cap)} 
                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Galeria de Fotos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={20} className="text-primary" />
                        Galeria de Produtos
                    </h3>
                    <label className="cursor-pointer text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1">
                        {uploadingGallery ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        Adicionar Fotos
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((img, index) => (
                        <div key={img.id || img.tempId || index} className="relative group aspect-square rounded-md overflow-hidden border border-gray-200">
                            <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(img)} 
                                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {gallery.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-400 text-sm italic">
                            Nenhuma imagem na galeria.
                        </div>
                    )}
                </div>
            </div>

            {/* Contato e Localização */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Contato e Localização
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Endereço / Localização</label>
                    <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Cidade, Estado"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <Mail size={14} /> E-mail
                    </label>
                    <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <Phone size={14} /> Telefone
                    </label>
                    <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <MessageSquare size={14} /> WhatsApp / Link de Contato
                    </label>
                    <input 
                    type="text" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="5511999999999 ou https://..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                        <Globe size={14} /> Website
                    </label>
                    <input 
                    type="url" 
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="https://..."
                    />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Settings & Logo */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Status e Verificação
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status da Conta</label>
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

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_verified"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_verified" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Fundição Verificada
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Logotipo</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Imagem da Logo</label>
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploadingLogo}
                    />
                    <label 
                        htmlFor="logo-upload"
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                            uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                        )}
                    >
                        {uploadingLogo ? (
                            <div className="flex flex-col items-center text-gray-500">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <span className="text-xs">Enviando...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <UploadCloud className="mb-2" size={24} />
                                <span className="text-xs font-bold">Clique para enviar</span>
                                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG (Fundo Transparente)</span>
                            </div>
                        )}
                    </label>
                </div>
              </div>

              {/* Logo Preview */}
              {formData.logo_url && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 h-40 bg-gray-50 flex items-center justify-center relative group">
                    <img 
                        src={formData.logo_url} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain p-4"
                    />
                    <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal de Capacidade */}
        {isCapModalOpen && currentCap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            {currentCap.id || currentCap.tempId ? 'Editar Capacidade' : 'Nova Capacidade'}
                        </h3>
                        <button 
                            type="button"
                            onClick={() => setIsCapModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título</label>
                            <input 
                                type="text" 
                                value={currentCap.title}
                                onChange={(e) => setCurrentCap({...currentCap, title: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
                                placeholder="Ex: Usinagem CNC"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição</label>
                            <textarea 
                                value={currentCap.description}
                                onChange={(e) => setCurrentCap({...currentCap, description: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm resize-none"
                                placeholder="Detalhes técnicos..."
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 flex justify-end gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsCapModalOpen(false)}
                            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button"
                            onClick={handleSaveCap}
                            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-bold hover:bg-primary-hover shadow-sm"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        )}

      </form>
    </AdminLayout>
  );
};

export default FoundryEditor;
