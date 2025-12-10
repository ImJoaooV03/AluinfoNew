import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, Building2, MapPin, Globe, Mail, Phone, ShieldCheck, Package, Plus, X, Edit2, Trash2, UploadCloud, Image as ImageIcon, MessageSquare, DollarSign, Link as LinkIcon, Star } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../contexts/ToastContext';
import { useRegion } from '../../contexts/RegionContext';

interface ProductItem {
  id?: string;
  tempId?: string;
  supplier_id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image_url: string;
  link_url?: string;
  type: 'product' | 'service';
}

const SupplierEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { categories, loading: categoriesLoading } = useCategories('supplier');
  const { addToast } = useToast();
  const { region } = useRegion();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

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
    rating: 5.0,
    region: region
  });

  // Estado dos Produtos
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
  
  // Estado do Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);

  // Garante a região correta ao criar novo
  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region: region }));
    }
  }, [region, isEditing]);

  // Carregar dados
  useEffect(() => {
    if (isEditing) {
      fetchSupplierAndProducts();
    } else {
        setFetching(false);
    }
  }, [id]);

  // Pré-selecionar categoria se disponível
  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  const fetchSupplierAndProducts = async () => {
    try {
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (supplierError) throw supplierError;

      if (supplierData) {
        setFormData({
          name: supplierData.name || '',
          category: supplierData.category || '',
          description: supplierData.description || '',
          phone: supplierData.phone || '',
          email: supplierData.email || '',
          whatsapp: supplierData.whatsapp || '',
          location: supplierData.location || '',
          website: supplierData.website || '',
          logo_url: supplierData.logo_url || '',
          status: supplierData.status || 'active',
          is_verified: supplierData.is_verified || false,
          rating: supplierData.rating || 5.0,
          region: supplierData.region
        });
      }

      const { data: productsData } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('supplier_id', id);
        
      if (productsData) setProducts(productsData as ProductItem[]);

    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      addToast('error', 'Falha ao carregar dados do fornecedor.');
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
    const fileName = `${region}_logo_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    
    setUploadingLogo(true);
    try {
      const { error } = await supabase.storage.from('supplier-logos').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('supplier-logos').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      addToast('success', 'Logo enviada!');
    } catch (err) { 
        addToast('error', 'Erro no upload da logo.'); 
    } finally { 
        setUploadingLogo(false); 
    }
  };

  // --- Gestão de Produtos ---

  const handleOpenProductModal = (product?: ProductItem) => {
    setCurrentProduct(product ? { ...product } : { 
        tempId: Math.random().toString(36).substr(2, 9), 
        name: '', 
        category: '', 
        price: '', 
        description: '', 
        image_url: '', 
        link_url: '', 
        type: 'product' 
    });
    setIsProductModalOpen(true);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentProduct) return;
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentProduct) return;
    const file = e.target.files[0];
    const fileName = `${region}_prod_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    
    setUploadingProductImg(true);
    try {
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setCurrentProduct(prev => prev ? ({ ...prev, image_url: data.publicUrl }) : null);
      addToast('success', 'Imagem do produto enviada!');
    } catch (err) { 
        addToast('error', 'Erro no upload da imagem do produto.'); 
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
        const idx = prev.findIndex(p => (p.id && p.id === currentProduct.id) || (p.tempId && p.tempId === currentProduct.tempId));
        if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = currentProduct;
            return updated;
        }
        return [...prev, currentProduct];
    });
    setIsProductModalOpen(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = (p: ProductItem) => {
    if (!confirm('Remover este item?')) return;
    if (p.id) setDeletedProductIds(prev => [...prev, p.id!]);
    setProducts(prev => prev.filter(i => i !== p));
  };

  // --- Salvamento Geral ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
        addToast('error', 'Nome e Categoria são obrigatórios.');
        return;
    }

    setLoading(true);

    try {
      const supplierPayload = {
        ...formData,
        region: isEditing ? formData.region : region,
        updated_at: new Date().toISOString(),
      };

      let supplierId = id;

      if (isEditing) {
        const { error: updateError } = await supabase.from('suppliers').update(supplierPayload).eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { data: newSupplier, error: insertError } = await supabase.from('suppliers').insert([{ ...supplierPayload, created_at: new Date().toISOString() }]).select().single();
        if (insertError) throw insertError;
        supplierId = newSupplier.id;
      }

      if (!supplierId) throw new Error("ID do fornecedor não gerado.");

      // Salvar Produtos
      const productsToUpsert = products.map(p => {
        const { tempId, ...rest } = p;
        return { 
            ...rest, 
            supplier_id: supplierId, 
            updated_at: new Date().toISOString() 
        };
      });

      if (productsToUpsert.length > 0) await supabase.from('supplier_products').upsert(productsToUpsert);
      if (deletedProductIds.length > 0) await supabase.from('supplier_products').delete().in('id', deletedProductIds);

      addToast('success', isEditing ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!');
      navigate(`/${region}/admin/suppliers`);
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
            <button type="button" onClick={() => navigate(`/${region}/admin/suppliers`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(`/${region}/admin/suppliers`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
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
                <Building2 size={16} /> Dados da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Empresa <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: Magma Engineering" />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria <span className="text-red-500">*</span></label>
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Sobre a empresa..." />
              </div>
            </div>

            {/* Catálogo de Produtos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex gap-2"><Package size={16} /> Catálogo de Produtos e Serviços</h3>
                    <button type="button" onClick={() => handleOpenProductModal()} className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-orange-50 transition-colors flex gap-1 items-center"><Plus size={14} /> Adicionar Item</button>
                </div>
                
                {products.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <Package className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500">Nenhum produto ou serviço cadastrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((p, i) => (
                            <div key={i} className="border border-gray-200 p-3 rounded-lg flex gap-3 hover:shadow-sm transition-shadow bg-gray-50/50">
                                <div className="w-16 h-16 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm text-gray-800 truncate" title={p.name}>{p.name}</p>
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => handleOpenProductModal(p)} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Edit2 size={14} /></button>
                                            <button type="button" onClick={() => handleDeleteProduct(p)} className="text-red-600 hover:bg-red-100 p-1 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{p.type === 'product' ? 'Produto' : 'Serviço'} • {p.category}</p>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contato */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                <MapPin size={16} /> Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Localização</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Cidade, Estado" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Mail size={14} /> E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Phone size={14} /> Telefone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><MessageSquare size={14} /> WhatsApp (Link ou Número)</label>
                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="5511999999999 ou https://wa.me/..." />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><Globe size={14} /> Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Logo */}
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
                        <span className="block text-sm font-bold text-gray-800 flex items-center gap-1"><ShieldCheck size={14} className="text-blue-600" /> Fornecedor Verificado</span>
                        <span className="block text-xs text-gray-500">Exibe selo de verificação</span>
                    </div>
                </label>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> Logotipo
              </h3>
              
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={uploadingLogo} />
                <label htmlFor="logo-upload" className={clsx("flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploadingLogo && "opacity-50 cursor-not-allowed")}>
                    {uploadingLogo ? (
                        <Loader2 className="animate-spin text-primary" size={24} />
                    ) : (
                        <>
                            <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                            <span className="text-sm font-medium text-gray-600">Enviar Logo</span>
                            <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
                        </>
                    )}
                </label>
              </div>
              
              {formData.logo_url && (
                <div className="mt-4 border rounded-lg h-40 flex items-center justify-center bg-gray-50 p-4 relative group">
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
        
        {/* Modal de Produto Completo */}
        {isProductModalOpen && currentProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-900">{currentProduct.id || currentProduct.tempId ? 'Editar Item' : 'Novo Item'}</h3>
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-4">
                        {/* Tipo */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="product" checked={currentProduct.type === 'product'} onChange={handleProductChange} className="text-primary focus:ring-primary" />
                                <span className="text-sm font-medium">Produto</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="service" checked={currentProduct.type === 'service'} onChange={handleProductChange} className="text-primary focus:ring-primary" />
                                <span className="text-sm font-medium">Serviço</span>
                            </label>
                        </div>

                        {/* Imagem do Produto */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Imagem</label>
                            <div className="flex gap-4 items-start">
                                <div className="w-24 h-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {currentProduct.image_url ? (
                                        <img src={currentProduct.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <label className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                        {uploadingProductImg ? <Loader2 className="animate-spin inline mr-2" size={14} /> : <UploadCloud className="inline mr-2" size={14} />}
                                        {uploadingProductImg ? 'Enviando...' : 'Escolher Imagem'}
                                        <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" disabled={uploadingProductImg} />
                                    </label>
                                    <p className="text-[10px] text-gray-400 mt-2">Recomendado: Quadrada (600x600)</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome</label>
                            <input type="text" name="name" value={currentProduct.name} onChange={handleProductChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Nome do produto ou serviço" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoria</label>
                                <input type="text" name="category" value={currentProduct.category} onChange={handleProductChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Equipamentos" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Preço (Opcional)</label>
                                <input type="text" name="price" value={currentProduct.price} onChange={handleProductChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Sob Consulta" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Link de Destino</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input type="url" name="link_url" value={currentProduct.link_url || ''} onChange={handleProductChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="https://..." />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Para onde o botão "Ver Detalhes" irá levar.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descrição</label>
                            <textarea name="description" value={currentProduct.description} onChange={handleProductChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Detalhes do item..." />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-colors">Cancelar</button>
                        <button type="button" onClick={handleSaveProduct} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-sm">Salvar Item</button>
                    </div>
                </div>
            </div>
        )}
      </form>
    </AdminLayout>
  );
};

export default SupplierEditor;
