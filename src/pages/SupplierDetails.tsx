import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail, Globe, Star, MessageCircle, Package, ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import AdSpot from '../components/AdSpot';
import { supabase } from '../lib/supabaseClient';
import { Supplier, Product } from '../types';

const SupplierDetails = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
        fetchSupplierData(id);
    }
  }, [id]);

  const fetchSupplierData = async (supplierId: string) => {
    try {
        setLoading(true);
        
        // 1. Fetch Supplier Info
        const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', supplierId)
            .single();

        if (supplierError) throw supplierError;

        if (supplierData) {
            setSupplier({
                id: supplierData.id,
                name: supplierData.name,
                logoUrl: supplierData.logo_url || '',
                category: supplierData.category,
                description: supplierData.description,
                phone: supplierData.phone,
                email: supplierData.email,
                whatsapp: supplierData.whatsapp, // Mapear novo campo
                location: supplierData.location,
                website: supplierData.website,
                isVerified: supplierData.is_verified,
                rating: supplierData.rating,
                status: supplierData.status,
                joinedDate: new Date(supplierData.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            });
        }

        // 2. Fetch Products
        const { data: productsData, error: productsError } = await supabase
            .from('supplier_products')
            .select('*')
            .eq('supplier_id', supplierId);

        if (productsError) throw productsError;

        if (productsData) {
            setProducts(productsData.map((p: any) => ({
                id: p.id,
                name: p.name,
                image: p.image_url || '',
                price: p.price,
                category: p.category,
                description: p.description,
                type: p.type,
                linkUrl: p.link_url // Mapear novo campo
            })));
        }

    } catch (err) {
        console.error('Erro ao buscar detalhes:', err);
        setError('Fornecedor não encontrado ou erro de conexão.');
    } finally {
        setLoading(false);
    }
  };

  const getContactLink = () => {
    if (!supplier) return '#';
    
    if (supplier.whatsapp) {
        // Se for URL completa (http/https), usa como está
        if (supplier.whatsapp.startsWith('http')) {
            return supplier.whatsapp;
        }
        
        // Se for apenas números (ex: 5511999999999), formata para wa.me
        // Remove tudo que não é dígito
        const cleanNumber = supplier.whatsapp.replace(/\D/g, '');
        
        // Verifica se tem um tamanho mínimo para ser um telefone (ex: > 8 dígitos)
        if (cleanNumber.length > 8) {
            return `https://wa.me/${cleanNumber}`;
        }
        
        // Caso contrário, retorna como está
        return supplier.whatsapp;
    }
    
    // Fallback para email se não tiver whatsapp
    return `mailto:${supplier.email}`;
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );
  }

  if (error || !supplier) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Fornecedor não encontrado</h2>
            <Link to="/fornecedores" className="text-primary hover:underline">Voltar para a lista</Link>
        </div>
    );
  }

  // Filter products and services
  const productList = products.filter(p => p.type === 'product');
  const serviceList = products.filter(p => p.type === 'service');

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <Link to="/fornecedores" className="hover:text-primary transition-colors">Fornecedores</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium truncate">{supplier.name}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        
        {/* Banner Topo Grande */}
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot 
                    position="top_large" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
                />
            </div>
            <div className="block md:hidden">
                <AdSpot 
                    position="top_large_mobile" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile"
                />
            </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{supplier.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie as informações e visualize o histórico deste fornecedor.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <a 
                    href={getContactLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-sm font-bold transition-colors shadow-sm uppercase tracking-wide",
                        supplier.whatsapp ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary-hover text-white"
                    )}
                >
                    {supplier.whatsapp ? <MessageCircle size={18} /> : <Mail size={18} />}
                    {supplier.whatsapp ? 'Enviar WhatsApp' : 'Enviar Mensagem'}
                </a>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                    {/* Logo Header */}
                    <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 p-8">
                        {supplier.logoUrl ? (
                            <img 
                                src={supplier.logoUrl} 
                                alt={supplier.name} 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <span className="text-gray-400 font-bold text-lg">Sem Logo</span>
                        )}
                    </div>
                    
                    <div className="p-6">
                        {/* Status & Rating */}
                        <div className="flex justify-between items-center mb-6">
                            <span className={clsx(
                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1",
                                supplier.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                <span className={clsx("w-1.5 h-1.5 rounded-full", supplier.status === 'active' ? "bg-green-600" : "bg-red-600")}></span>
                                {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-bold text-gray-700">{supplier.rating || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">Localização</span>
                                    <span className="text-sm text-gray-700">{supplier.location}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">Telefone</span>
                                    <span className="text-sm text-gray-700">{supplier.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">E-mail</span>
                                    <span className="text-sm text-gray-700">{supplier.email}</span>
                                </div>
                            </div>
                            {supplier.website && (
                                <div className="flex items-start gap-3">
                                    <Globe className="text-gray-400 mt-0.5" size={16} />
                                    <div>
                                        <span className="block text-xs text-gray-400 font-bold uppercase">Website</span>
                                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                            Visitar site <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-gray-400">Categoria</span>
                                <span className="text-sm font-bold text-gray-800">{supplier.category}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400">Membro desde</span>
                                <span className="text-sm font-bold text-gray-800">{supplier.joinedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Sobre a Empresa</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {supplier.description}
                    </p>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-8">
                
                {/* Single Tab Navigation */}
                <div className="bg-white border border-gray-200 rounded-sm shadow-sm mb-6">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button 
                            className="flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 border-primary text-primary bg-orange-50/50 transition-colors whitespace-nowrap"
                        >
                            <Package size={18} />
                            Catálogo de Produtos e Serviços
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    
                    {/* Products Section */}
                    {productList.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">Produtos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {productList.map(product => (
                                    <div key={product.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-24 h-24 bg-gray-100 rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-grow min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase truncate pr-2">{product.category}</span>
                                                <span className="text-xs font-bold text-primary whitespace-nowrap">{product.price}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" title={product.name}>{product.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                            
                                            {product.linkUrl ? (
                                                <a 
                                                    href={product.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-auto w-fit text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                                                >
                                                    Ver Detalhes <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <button disabled className="mt-auto w-fit text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-sm cursor-not-allowed">
                                                    Ver Detalhes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Section */}
                    {serviceList.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">Serviços</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {serviceList.map(service => (
                                    <div key={service.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-24 h-24 bg-gray-100 rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden">
                                            {service.image ? (
                                                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-grow min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase truncate pr-2">{service.category}</span>
                                                <span className="text-xs font-bold text-primary whitespace-nowrap">{service.price}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" title={service.name}>{service.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                                            
                                            {service.linkUrl ? (
                                                <a 
                                                    href={service.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-auto w-fit text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                                                >
                                                    Ver Detalhes <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <button disabled className="mt-auto w-fit text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-sm cursor-not-allowed">
                                                    Ver Detalhes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {productList.length === 0 && serviceList.length === 0 && (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Este fornecedor ainda não cadastrou produtos ou serviços.</p>
                        </div>
                    )}

                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default SupplierDetails;
