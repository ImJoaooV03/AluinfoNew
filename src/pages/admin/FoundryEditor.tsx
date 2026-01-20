import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, Factory, MapPin, Globe, Mail, Phone, ShieldCheck, UploadCloud, Image as ImageIcon, Trash2, Plus, Layers, MessageSquare, Star, X, Edit2, Link as LinkIcon, Package } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';

// Interfaces
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

interface ProductItem {
  id?: string;
  tempId?: string;
  foundry_id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image_url: string;
  link_url?: string;
  type: 'product' | 'service';
}

const FoundryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { region } = useRegion();
  const { hierarchicalCategories, loading: categoriesLoading } = useCategories('foundry'); 
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

  // Form Data
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

  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  
  const [deletedCapabilityIds, setDeletedCapabilityIds] = useState<string[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);

  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [currentCap, setCurrentCap] = useState<Capability | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region: region }));
    }
  }, [region, isEditing]);

  useEffect(() => {
    if (isEditing) {
      fetchFoundryData();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchFoundryData = async () => {
    try {
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

      const { data: caps } = await supabase.from('foundry_capabilities').select('*').eq('foundry_id', id);
      if (caps) setCapabilities(caps);

      const { data: gal } = await supabase.from('foundry_gallery').select('*').eq('foundry_id', id);
      if (gal) setGallery(gal);

      const { data: prods } = await supabase.from('supplier_products').select('*').eq('foundry_id', id);
      if (prods) setProducts(prods as ProductItem[]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileName = `${region}_foundry_logo_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    
    setUploadingLogo(true);
    try {
      const { error } = await supabase.storage.from('foundry-logos').upload(fileName, file);
      if (error) {
          // Fallback bucket
          await supabase.storage.from('supplier-logos').upload(fileName, file);
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

  // --- Product Management ---

  const handleOpenProductModal = (product?: ProductItem) => {
    setCurrentProduct(product ? { ...product } : { 
        tempId: Math.random().toString(), 
        name: '', 
        category: '', 
        price: '', 
        description: '', 
        image_url: '', 
        type: 'product',
        link_url: ''
    });
    setIsProductModalOpen(true);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentProduct) {
        setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentProduct) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_prod_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingProductImg(true);
    try {
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        
        let publicUrl = '';
        if (uploadError) {
             console.warn('Bucket product-images falhou, tentando fallback', uploadError);
             await supabase.storage.from('news-images').upload(fileName, file);
             const { data } = supabase.storage.from('news-images').getPublicUrl(fileName);
             publicUrl = data.publicUrl;
        } else {
             const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
             publicUrl = data.publicUrl;
        }
        
        setCurrentProduct(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);
        addToast('success', 'Imagem do produto enviada!');
    } catch (err) {
        console.error(err);
        addToast('error', 'Erro no upload da imagem.');
    } finally {
        setUploadingProductImg(false);
    }
  };

  const handleSaveProduct = () => {
    if (!currentProduct || !currentProduct.name) {
        addToast('error', 'Nome do produto é obrigatório.');
        return;
    }

    setProducts(prev => {
        const exists = prev.some(p => (p.id && p.id === currentProduct.id) || (p.tempId && p.tempId === currentProduct.tempId));
        if (exists) {
            return prev.map(p => (p.id && p.id === currentProduct.id) || (p.tempId && p.tempId === currentProduct.tempId) ? currentProduct : p);
        }
        return [...prev, currentProduct];
    });
    
    setIsProductModalOpen(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = (product: ProductItem) => {
    if (product.id) {
        setDeletedProductIds(prev => [...prev, product.id!]);
    }
    setProducts(prev => prev.filter(p => p !== product));
  };

  // --- Capabilities & Gallery (Simplified for brevity) ---
  const handleOpenCapModal = (cap?: Capability) => {
      setCurrentCap(cap ? { ...cap } : { tempId: Math.random().toString(), title: '', description: '' });
      setIsCapModalOpen(true);
  };
  const handleSaveCap = () => {
      if (!currentCap?.title) return;
      setCapabilities(prev => {
          const exists = prev.some(c => (c.id && c.id === currentCap.id) || (c.tempId && c.tempId === currentCap.tempId));
          if (exists) return prev.map(c => (c.id === currentCap.id || c.tempId === currentCap.tempId) ? currentCap : c);
          return [...prev, currentCap];
      });
      setIsCapModalOpen(false);
  };
  const handleDeleteCap = (cap: Capability) => {
      if (cap.id) setDeletedCapabilityIds(prev => [...prev, cap.id!]);
      setCapabilities(prev => prev.filter(c => c !== cap));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
        addToast('error', 'Nome e Categoria são obrigatórios.');
        return;
    }
    setLoading(true);
    try {
      // 1. Save Foundry
      let foundryId = id;
      const payload = {
        ...formData,
        region: isEditing ? formData.region : region,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        await supabase.from('foundries').update(payload).eq('id', id);
      } else {
        const { data, error } = await supabase.from('foundries').insert([{ ...payload, created_at: new Date().toISOString() }]).select().single();
        if (error) throw error;
        foundryId = data.id;
      }

      // 2. Save Capabilities
      if (deletedCapabilityIds.length > 0) await supabase.from('foundry_capabilities').delete().in('id', deletedCapabilityIds);
      if (capabilities.length > 0 && foundryId) {
          for (const cap of capabilities) {
              const capData = { foundry_id: foundryId, title: cap.title, description: cap.description };
              if (cap.id) await supabase.from('foundry_capabilities').update(capData).eq('id', cap.id);
              else await supabase.from('foundry_capabilities').insert([capData]);
          }
      }

      // 3. Save Products
      if (deletedProductIds.length > 0) await supabase.from('supplier_products').delete().in('id', deletedProductIds);
      if (products.length > 0 && foundryId) {
          for (const p of products) {
              const prodData = {
                  foundry_id: foundryId, // Use foundry_id here
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  description: p.description,
                  image_url: p.image_url,
                  link_url: p.link_url,
                  type: p.type
              };
              if (p.id) await supabase.from('supplier_products').update(prodData).eq('id', p.id);
              else await supabase.from('supplier_products').insert([prodData]);
          }
      }

      addToast('success', isEditing ? 'Fundição atualizada!' : 'Fundição cadastrada!');
      navigate(`/${region}/admin/foundries`);
    } catch (err: any) {
      addToast('error', 'Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <AdminLayout><div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(`/${region}/admin/foundries`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Fundição' : 'Novo Fundição'}</h1>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <Factory size={16} /> Dados da Fundição
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Fundição <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-800" required />
                </div>
                
                {/* Seletor Hierárquico */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Processo Principal <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" required>
                        <option value="">Selecione...</option>
                        {hierarchicalCategories.map(parent => (
                            <React.Fragment key={parent.id}>
                                <option value={parent.name} className="font-bold bg-gray-100 text-gray-900">📂 {parent.name}</option>
                                {parent.subcategories?.map(sub => (
                                    <option key={sub.id} value={sub.name}>&nbsp;&nbsp;&nbsp;↳ {sub.name}</option>
                                ))}
                            </React.Fragment>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Star size={14} /> Avaliação</label>
                    <input type="number" name="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="5" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none" />
              </div>
            </div>

            {/* Products & Services Section (NEW) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex gap-2">
                        <Package size={16} /> Produtos e Serviços
                    </h3>
                    <button 
                        type="button" 
                        onClick={() => handleOpenProductModal()}
                        className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1"
                    >
                        <Plus size={14} /> Adicionar Item
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Package className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500">Nenhum produto ou serviço cadastrado.</p>
                        <button type="button" onClick={() => handleOpenProductModal()} className="text-xs text-primary font-bold hover:underline mt-1">Adicionar agora</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.map((product, index) => (
                            <div key={product.id || product.tempId || index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group bg-white">
                                <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                                            <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                                <span className={clsx("px-1.5 py-0.5 rounded uppercase text-[10px] font-bold", product.type === 'product' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700")}>
                                                    {product.type === 'product' ? 'Produto' : 'Serviço'}
                                                </span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{product.category}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{product.price || 'Sob Consulta'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">{product.description}</p>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => handleOpenProductModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                                    <button type="button" onClick={() => handleDeleteProduct(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Capabilities Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex gap-2">
                        <Layers size={16} /> Capacidades Técnicas
                    </h3>
                    <button type="button" onClick={() => handleOpenCapModal()} className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1">
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {capabilities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma capacidade registrada.</p>
                ) : (
                    <div className="space-y-3">
                        {capabilities.map((cap, index) => (
                            <div key={cap.id || cap.tempId || index} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-start group">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">{cap.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{cap.description}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => handleOpenCapModal(cap)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Edit2 size={12} /></button>
                                    <button type="button" onClick={() => handleDeleteCap(cap)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contato e Métricas */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                    <MapPin size={16} /> Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Localização</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">E-mail</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Telefone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <ShieldCheck size={16} /> Configurações
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleCheckboxChange} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800 flex items-center gap-1"><ShieldCheck size={14} className="text-blue-600" /> Verificado</span>
                    </div>
                </label>
              </div>
            </div>

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
          </div>
        </div>

        {/* Product Modal */}
        {isProductModalOpen && currentProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900">
                            {currentProduct.id || currentProduct.tempId ? 'Editar Item' : 'Novo Item'}
                        </h3>
                        <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome do Item <span className="text-red-500">*</span></label>
                                <input type="text" name="name" value={currentProduct.name} onChange={handleProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="Ex: Peça Fundida X" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tipo</label>
                                <select name="type" value={currentProduct.type} onChange={handleProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                    <option value="product">Produto</option>
                                    <option value="service">Serviço</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Preço (Opcional)</label>
                                <input type="text" name="price" value={currentProduct.price} onChange={handleProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Sob Consulta" />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria do Item</label>
                                <input type="text" name="category" value={currentProduct.category} onChange={handleProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Peças Automotivas" />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Link Externo (Opcional)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    <input type="url" name="link_url" value={currentProduct.link_url || ''} onChange={handleProductChange} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                                <textarea name="description" value={currentProduct.description} onChange={handleProductChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Breve descrição..." />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Imagem</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden relative">
                                        {currentProduct.image_url ? (
                                            <img src={currentProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                                        )}
                                        {uploadingProductImg && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-white" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="relative">
                                            <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" id="prod-img-upload" disabled={uploadingProductImg} />
                                            <label htmlFor="prod-img-upload" className={clsx("inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors", uploadingProductImg && "opacity-50 cursor-not-allowed")}>
                                                <UploadCloud size={16} />
                                                {uploadingProductImg ? 'Enviando...' : 'Escolher Imagem'}
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2">Recomendado: Quadrado (500x500px). Max 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                        <button type="button" onClick={handleSaveProduct} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salvar Item</button>
                    </div>
                </div>
            </div>
        )}

        {/* Capability Modal */}
        {isCapModalOpen && currentCap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-900">Adicionar Capacidade</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título</label>
                            <input type="text" value={currentCap.title} onChange={e => setCurrentCap({...currentCap, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Usinagem CNC" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                            <textarea value={currentCap.description} onChange={e => setCurrentCap({...currentCap, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Detalhes..." />
                        </div>
                    </div>
                    <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCapModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Cancelar</button>
                        <button type="button" onClick={handleSaveCap} className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Salvar</button>
                    </div>
                </div>
            </div>
        )}

      </form>
    </AdminLayout>
  );
};

export default FoundryEditor;
