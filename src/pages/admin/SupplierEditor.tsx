import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, AlertCircle, Building2, MapPin, Globe, Mail, Phone, ShieldCheck, Package, Plus, X, Edit2, Trash2, UploadCloud, Image as ImageIcon, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { useCategories } from '../../hooks/useCategories';

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

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  // Dados do Fornecedor
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
    rating: 0
  });

  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Dados do Catálogo
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
  
  // Estado do Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const [productUploading, setProductUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchSupplierAndProducts();
    } else {
        setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isEditing && !formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, isEditing, formData.category]);

  const fetchSupplierAndProducts = async () => {
    try {
      // 1. Buscar Fornecedor
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
          rating: supplierData.rating || 0
        });
      }

      // 2. Buscar Produtos
      const { data: productsData, error: productsError } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('supplier_id', id);

      if (productsError) throw productsError;

      if (productsData) {
        setProducts(productsData as ProductItem[]);
      }

    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar dados do fornecedor.');
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

  // --- Upload de Logo ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setUploadingLogo(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('supplier-logos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('supplier-logos')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar logotipo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- Lógica do Catálogo de Produtos ---

  const handleOpenProductModal = (product?: ProductItem) => {
    if (product) {
      setCurrentProduct({ ...product });
    } else {
      setCurrentProduct({
        tempId: Math.random().toString(36).substr(2, 9),
        name: '',
        category: '',
        price: 'Sob Consulta',
        description: '',
        image_url: '',
        link_url: '',
        type: 'product'
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentProduct) return;
    const { name, value } = e.target;
    setCurrentProduct(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentProduct) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `prod_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    setProductUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      setCurrentProduct(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar imagem do produto.');
    } finally {
      setProductUploading(false);
    }
  };

  const handleSaveProduct = () => {
    if (!currentProduct) return;
    if (!currentProduct.name) {
        alert("O nome do produto é obrigatório");
        return;
    }

    setProducts(prev => {
      const exists = prev.findIndex(p => (p.id && p.id === currentProduct.id) || (p.tempId && p.tempId === currentProduct.tempId));
      
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = currentProduct;
        return updated;
      } else {
        return [...prev, currentProduct];
      }
    });
    
    setIsProductModalOpen(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = (product: ProductItem) => {
    if (window.confirm('Remover este item do catálogo?')) {
        if (product.id) {
            setDeletedProductIds(prev => [...prev, product.id!]);
        }
        setProducts(prev => prev.filter(p => p !== product));
    }
  };

  // --- Salvar Tudo ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Salvar Fornecedor
      const supplierPayload = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      let supplierId = id;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('suppliers')
          .update(supplierPayload)
          .eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { data: newSupplier, error: insertError } = await supabase
          .from('suppliers')
          .insert([{ ...supplierPayload, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (insertError) throw insertError;
        supplierId = newSupplier.id;
      }

      if (!supplierId) throw new Error("ID do fornecedor não encontrado.");

      // 2. Processar Produtos (Adicionar/Atualizar)
      const productsToUpsert = products.map(p => {
        const { tempId, ...rest } = p;
        return {
            ...rest,
            supplier_id: supplierId,
            updated_at: new Date().toISOString()
        };
      });

      if (productsToUpsert.length > 0) {
          const { error: productsError } = await supabase
            .from('supplier_products')
            .upsert(productsToUpsert);
          if (productsError) throw productsError;
      }

      // 3. Processar Produtos (Remover)
      if (deletedProductIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('supplier_products')
            .delete()
            .in('id', deletedProductIds);
          if (deleteError) throw deleteError;
      }

      navigate('/admin/suppliers');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar fornecedor.');
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
              onClick={() => navigate('/admin/suppliers')}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Atualize os dados e o catálogo.' : 'Cadastre um novo parceiro e seus produtos.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/admin/suppliers')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || uploadingLogo}
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
            
            {/* Dados da Empresa */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Dados da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Empresa</label>
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
                  placeholder="Breve descrição dos serviços e produtos..."
                />
              </div>
            </div>

            {/* Catálogo de Produtos e Serviços */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} className="text-primary" />
                        Catálogo de Produtos e Serviços
                    </h3>
                    <button 
                        type="button"
                        onClick={() => handleOpenProductModal()}
                        className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Plus size={14} /> Adicionar Item
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                        <Package size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhum produto ou serviço cadastrado.</p>
                        <button 
                            type="button"
                            onClick={() => handleOpenProductModal()}
                            className="text-primary text-xs font-bold hover:underline mt-1"
                        >
                            Adicionar o primeiro item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product, index) => (
                            <div key={product.id || product.tempId || index} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow relative group">
                                <div className="w-20 h-20 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden border border-gray-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase truncate pr-2">{product.category}</span>
                                        <span className="text-xs font-bold text-primary whitespace-nowrap">{product.price}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" title={product.name}>{product.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                                    <span className={clsx(
                                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase w-fit",
                                        product.type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                    )}>
                                        {product.type === 'product' ? 'Produto' : 'Serviço'}
                                    </span>
                                </div>
                                
                                {/* Actions Overlay */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm">
                                    <button 
                                        type="button"
                                        onClick={() => handleOpenProductModal(product)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteProduct(product)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                  Fornecedor Verificado
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
                        title="Remover logo"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal de Produto */}
        {isProductModalOpen && currentProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            {currentProduct.id || currentProduct.tempId ? 'Editar Item' : 'Novo Item'}
                        </h3>
                        <button 
                            type="button"
                            onClick={() => setIsProductModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="product"
                                        checked={currentProduct.type === 'product'}
                                        onChange={handleProductChange}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Produto</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="service"
                                        checked={currentProduct.type === 'service'}
                                        onChange={handleProductChange}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Serviço</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Item</label>
                            <input 
                                type="text" 
                                name="name"
                                value={currentProduct.name}
                                onChange={handleProductChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
                                placeholder="Ex: Forno a Gás"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoria</label>
                                <input 
                                    type="text" 
                                    name="category"
                                    value={currentProduct.category}
                                    onChange={handleProductChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
                                    placeholder="Ex: Equipamentos"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preço</label>
                                <input 
                                    type="text" 
                                    name="price"
                                    value={currentProduct.price}
                                    onChange={handleProductChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
                                    placeholder="Ex: Sob Consulta"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Link do Botão "Ver Detalhes"</label>
                            <input 
                                type="url" 
                                name="link_url"
                                value={currentProduct.link_url || ''}
                                onChange={handleProductChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
                                placeholder="https://..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">URL para onde o usuário será redirecionado ao clicar (ex: PDF, Página Externa).</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição</label>
                            <textarea 
                                name="description"
                                value={currentProduct.description}
                                onChange={handleProductChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm resize-none"
                                placeholder="Detalhes técnicos..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Imagem</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {currentProduct.image_url ? (
                                        <img src={currentProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={20} className="text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-fit">
                                        {productUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                        <span className="text-xs font-bold text-gray-600">Carregar Imagem</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleProductImageUpload}
                                            disabled={productUploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 flex justify-end gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsProductModalOpen(false)}
                            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button"
                            onClick={handleSaveProduct}
                            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-bold hover:bg-primary-hover shadow-sm"
                        >
                            Salvar Item
                        </button>
                    </div>
                </div>
            </div>
        )}

      </form>
    </AdminLayout>
  );
};

export default SupplierEditor;
