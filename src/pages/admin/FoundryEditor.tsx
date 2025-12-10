import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, Factory, MapPin, Globe, Mail, Phone, ShieldCheck, UploadCloud, Image as ImageIcon, Trash2, Plus, Layers, BarChart3, MessageSquare, Star, X, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';

interface Capability {
  id?: string;
  tempId?: string;
  foundry_id?: string;
  title: string;
  description: string;
}

interface GalleryImage {
  id?: string;
  tempId?: string;
  foundry_id?: string;
  image_url: string;
}

const FoundryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { categories, loading: categoriesLoading } = useCategories('foundry');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form Data Principal
  const [formData, setFormData] = useState({
    name: '',
    category: '',
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
    certification: '',
    years_experience: '',
    monthly_capacity: '',
    market_reach: '',
    region: region
  });

  // Estados Relacionados
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [deletedCapabilityIds, setDeletedCapabilityIds] = useState<string[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);
  
  // Modal de Capacidade
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [currentCap, setCurrentCap] = useState<Capability | null>(null);

  // Garante a região correta ao criar novo
  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region: region }));
    }
  }, [region, isEditing]);

  // Carregar dados
  useEffect(() => {
    if (isEditing) {
      fetchFoundryData();
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

  const fetchFoundryData = async () => {
    try {
      // 1. Dados da Fundição
      const { data, error } = await supabase
        .from('foundries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || '',
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
          market_reach: data.market_reach || '',
          region: data.region
        });
      }

      // 2. Capacidades
      const { data: caps } = await supabase
        .from('foundry_capabilities')
        .select('*')
        .eq('foundry_id', id);
      
      if (caps) setCapabilities(caps);

      // 3. Galeria
      const { data: gal } = await supabase
        .from('foundry_gallery')
        .select('*')
        .eq('foundry_id', id);

      if (gal) setGallery(gal);

    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      addToast('error', 'Falha ao carregar dados da fundição.');
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

  // --- Uploads ---

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileName = `${region}_foundry_logo_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    
    setUploadingLogo(true);
    try {
      const { error } = await supabase.storage.from('foundry-logos').upload(fileName, file);
      if (error) {
          // Fallback se bucket não existir, tenta supplier-logos
          const { error: fallbackError } = await supabase.storage.from('supplier-logos').upload(fileName, file);
          if (fallbackError) throw fallbackError;
          const { data } = supabase.storage.from('supplier-logos').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      } else {
          const { data } = supabase.storage.from('foundry-logos').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      }
      addToast('success', 'Logo enviada!');
    } catch (err) { 
        addToast('error', 'Erro no upload da logo.'); 
    } finally { 
        setUploadingLogo(false); 
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingGallery(true);
    
    try {
        const newImages: GalleryImage[] = [];
        
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const fileName = `${region}_foundry_gal_${Date.now()}_${i}.${file.name.split('.').pop()}`;
            
            // Tenta bucket específico, senão usa genérico
            let publicUrl = '';
            const { error } = await supabase.storage.from('foundry-gallery').upload(fileName, file);
            
            if (error) {
                 const { error: fallbackError } = await supabase.storage.from('product-images').upload(fileName, file);
                 if (fallbackError) throw fallbackError;
                 const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                 publicUrl = data.publicUrl;
            } else {
                 const { data } = supabase.storage.from('foundry-gallery').getPublicUrl(fileName);
                 publicUrl = data.publicUrl;
            }

            newImages.push({
                tempId: Math.random().toString(36).substr(2, 9),
                image_url: publicUrl
            });
        }
        
        setGallery(prev => [...prev, ...newImages]);
        addToast('success', 'Imagens adicionadas à galeria!');
    } catch (err) {
        addToast('error', 'Erro no upload da galeria.');
    } finally {
        setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (img: GalleryImage) => {
    if (img.id) {
        setDeletedGalleryIds(prev => [...prev, img.id!]);
    }
    setGallery(prev => prev.filter(i => i !== img));
  };

  // --- Capacidades ---

  const handleOpenCapModal = (cap?: Capability) => {
    setCurrentCap(cap ? { ...cap } : { 
        tempId: Math.random().toString(36).substr(2, 9), 
        title: '', 
        description: '' 
    });
    setIsCapModalOpen(true);
  };

  const handleSaveCap = () => {
    if (!currentCap || !currentCap.title) {
        addToast('error', 'Título da capacidade é obrigatório.');
        return;
    }

    setCapabilities(prev => {
        const idx = prev.findIndex(c => (c.id && c.id === currentCap.id) || (c.tempId && c.tempId === currentCap.tempId));
        if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = currentCap;
            return updated;
        }
        return [...prev, currentCap];
    });
    setIsCapModalOpen(false);
    setCurrentCap(null);
  };

  const handleDeleteCap = (cap: Capability) => {
    if (!confirm('Remover esta capacidade?')) return;
    if (cap.id) setDeletedCapabilityIds(prev => [...prev, cap.id!]);
    setCapabilities(prev => prev.filter(c => c !== cap));
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
        addToast('error', 'Nome e Categoria são obrigatórios.');
        return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        region: isEditing ? formData.region : region,
        updated_at: new Date().toISOString(),
      };

      let foundryId = id;

      // 1. Salvar Fundição
      if (isEditing) {
        const { error: updateError } = await supabase.from('foundries').update(payload).eq('id', id);
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

      if (!foundryId) throw new Error("ID da fundição não gerado.");

      // 2. Salvar Capacidades
      const capsToUpsert = capabilities.map(c => {
        const { tempId, ...rest } = c;
        return { 
            ...rest, 
            foundry_id: foundryId, 
            updated_at: new Date().toISOString() 
        };
      });

      if (capsToUpsert.length > 0) await supabase.from('foundry_capabilities').upsert(capsToUpsert);
      if (deletedCapabilityIds.length > 0) await supabase.from('foundry_capabilities').delete().in('id', deletedCapabilityIds);

      // 3. Salvar Galeria
      const galleryToInsert = gallery
        .filter(g => !g.id) // Apenas novas (sem ID do banco)
        .map(g => ({ 
            foundry_id: foundryId, 
            image_url: g.image_url 
        }));

      if (galleryToInsert.length > 0) await supabase.from('foundry_gallery').insert(galleryToInsert);
      if (deletedGalleryIds.length > 0) await supabase.from('foundry_gallery').delete().in('id', deletedGalleryIds);

      addToast('success', isEditing ? 'Fundição atualizada!' : 'Fundição cadastrada!');
      navigate(`/${region}/admin/foundries`);
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Erro ao salvar: ' + err.message);
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
            <button type="button" onClick={() => navigate(`/${region}/admin/foundries`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Fundição' : 'Nova Fundição'}</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(`/${region}/admin/foundries`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-sm">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dados Básicos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <Factory size={16} /> Dados da Fundição
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Fundição <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: Fundição Alumax" />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Processo Principal <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" required>
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Star size={14} /> Avaliação (0-5)</label>
                    <input type="number" name="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="5" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição / Sobre</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="História e especialidades da fundição..." />
              </div>
            </div>

            {/* Métricas Industriais */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                    <BarChart3 size={16} /> Métricas & Capacidade
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Certificação</label>
                        <input type="text" name="certification" value={formData.certification} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: ISO 9001" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Anos de Experiência</label>
                        <input type="text" name="years_experience" value={formData.years_experience} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 25+" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Capacidade Mensal</label>
                        <input type="text" name="monthly_capacity" value={formData.monthly_capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 500 Ton" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Abrangência</label>
                        <input type="text" name="market_reach" value={formData.market_reach} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Nacional" />
                    </div>
                </div>
            </div>

            {/* Capacidades e Serviços */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex gap-2"><Layers size={16} /> Capacidades & Serviços</h3>
                    <button type="button" onClick={() => handleOpenCapModal()} className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-orange-50 transition-colors flex gap-1 items-center"><Plus size={14} /> Adicionar</button>
                </div>
                
                {capabilities.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <Layers className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500">Nenhuma capacidade cadastrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="border border-gray-200 p-3 rounded-lg flex justify-between items-start hover:shadow-sm transition-shadow bg-gray-50/50">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">{cap.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{cap.description}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button type="button" onClick={() => handleOpenCapModal(cap)} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Edit2 size={14} /></button>
                                    <button type="button" onClick={() => handleDeleteCap(cap)} className="text-red-600 hover:bg-red-100 p-1 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Settings, Contact & Media */}
          <div className="space-y-6">
            
            {/* Status */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <ShieldCheck size={16} /> Configurações
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleCheckboxChange} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800 flex items-center gap-1"><ShieldCheck size={14} className="text-blue-600" /> Fundição Verificada</span>
                        <span className="block text-xs text-gray-500">Exibe selo de verificação</span>
                    </div>
                </label>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <MapPin size={16} /> Contato
              </h3>
              <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Localização</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Cidade, Estado" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Mail size={14} /> E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Phone size={14} /> Telefone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><MessageSquare size={14} /> WhatsApp</label>
                  <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Número ou Link" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Globe size={14} /> Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://..." />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> Logotipo
              </h3>
              
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={uploadingLogo} />
                <label htmlFor="logo-upload" className={clsx("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingLogo && "opacity-50 cursor-not-allowed")}>
                    {uploadingLogo ? (
                        <Loader2 className="animate-spin text-primary" size={24} />
                    ) : (
                        <>
                            <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs font-medium text-gray-600">Enviar Logo</span>
                        </>
                    )}
                </label>
              </div>
              
              {formData.logo_url && (
                <div className="mt-4 border rounded-lg h-32 flex items-center justify-center bg-gray-50 p-4 relative group">
                    <img src={formData.logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              )}
            </div>

            {/* Galeria de Fotos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <ImageIcon size={16} /> Galeria de Fotos
                </h3>
                
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingGallery ? <Loader2 className="animate-spin mx-auto" /> : <UploadCloud className="mx-auto text-gray-400 mb-2" />}
                    <span className="text-xs font-bold text-gray-600 block">Adicionar Fotos</span>
                    <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" disabled={uploadingGallery} />
                </label>

                <div className="grid grid-cols-3 gap-2 mt-4">
                    {gallery.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded border overflow-hidden group">
                            <img src={img.image_url} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handleRemoveGalleryImage(img)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
        
        {/* Modal de Capacidade */}
        {isCapModalOpen && currentCap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-900">{currentCap.id || currentCap.tempId ? 'Editar Capacidade' : 'Nova Capacidade'}</h3>
                        <button type="button" onClick={() => setIsCapModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título</label>
                            <input type="text" value={currentCap.title} onChange={e => setCurrentCap({...currentCap, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Injeção de Alumínio" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                            <textarea value={currentCap.description} onChange={e => setCurrentCap({...currentCap, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" rows={3} placeholder="Detalhes técnicos..." />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCapModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-colors">Cancelar</button>
                        <button type="button" onClick={handleSaveCap} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-sm">Salvar</button>
                    </div>
                </div>
            </div>
        )}
      </form>
    </AdminLayout>
  );
};

export default FoundryEditor;
