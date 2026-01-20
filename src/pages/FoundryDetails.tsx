import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail, Globe, CheckCircle, Layers, Settings, ShieldCheck, Star, ExternalLink, Factory, Image as ImageIcon, Loader2, MessageCircle, Package, Tag } from 'lucide-react';
import clsx from 'clsx';
import AdSpot from '../components/AdSpot';
import { supabase } from '../lib/supabaseClient';
import { Foundry, Product } from '../types';
import { useRegion } from '../contexts/RegionContext';

interface Capability {
  id: string;
  title: string;
  description: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
}

const FoundryDetails = () => {
  const { id } = useParams();
  const { region, t } = useRegion();
  const [foundry, setFoundry] = useState<Foundry | null>(null);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
        fetchFoundryData(id);
    } else {
        setLoading(false);
        setError('ID da fundição não fornecido.');
    }
  }, [id, region]);

  // Helper seguro para formatar datas
  const safeDate = (dateString?: string) => {
    if (!dateString) return 'Data n/a';
    try {
        return new Date(dateString).toLocaleDateString(region === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
        return 'Data inválida';
    }
  };

  const fetchFoundryData = async (foundryId: string) => {
    try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch Foundry Info
        const { data: foundryData, error: foundryError } = await supabase
            .from('foundries')
            .select('*')
            .eq('id', foundryId)
            .eq('region', region) // Filtro Estrito por Região
            .single();

        if (foundryError) throw foundryError;

        if (foundryData) {
            setFoundry({
                id: foundryData.id,
                name: foundryData.name || 'Nome Indisponível',
                logoUrl: foundryData.logo_url || '',
                category: foundryData.category || 'Geral',
                description: foundryData.description || '',
                phone: foundryData.phone || '',
                email: foundryData.email || '',
                location: foundryData.location || '',
                website: foundryData.website || '',
                isVerified: !!foundryData.is_verified,
                rating: foundryData.rating || 0,
                status: foundryData.status || 'inactive',
                joinedDate: safeDate(foundryData.created_at),
                whatsapp: foundryData.whatsapp || '',
                certification: foundryData.certification || '',
                yearsExperience: foundryData.years_experience || '',
                monthlyCapacity: foundryData.monthly_capacity || '',
                marketReach: foundryData.market_reach || ''
            });
        }

        // 2. Fetch Capabilities
        const { data: capsData } = await supabase
            .from('foundry_capabilities')
            .select('*')
            .eq('foundry_id', foundryId);
        
        if (capsData) setCapabilities(capsData);

        // 3. Fetch Gallery
        const { data: galleryData } = await supabase
            .from('foundry_gallery')
            .select('*')
            .eq('foundry_id', foundryId);

        if (galleryData) setGallery(galleryData);

        // 4. Fetch Products (Using supplier_products table with foundry_id)
        const { data: productsData } = await supabase
            .from('supplier_products')
            .select('*')
            .eq('foundry_id', foundryId);

        if (productsData) {
            setProducts(productsData.map((p: any) => ({
                id: p.id,
                name: p.name || 'Item sem nome',
                image: p.image_url || '',
                price: p.price || '',
                category: p.category || 'Geral',
                description: p.description || '',
                type: p.type || 'product',
                linkUrl: p.link_url || ''
            })));
        }

    } catch (err: any) {
        console.error('Erro ao buscar detalhes:', err);
        setError('Fundição não encontrada ou indisponível nesta região.');
    } finally {
        setLoading(false);
    }
  };

  const getContactLink = () => {
    if (!foundry) return '#';
    
    if (foundry.whatsapp) {
        const wa = foundry.whatsapp;
        if (wa.startsWith('http')) return wa;
        const cleanNumber = wa.replace(/\D/g, '');
        if (cleanNumber.length > 8) return `https://wa.me/${cleanNumber}`;
        return wa;
    }
    
    return `mailto:${foundry.email}`;
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );
  }

  if (error || !foundry) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ops!</h2>
            <p className="text-gray-600 mb-4">{error || 'Fundição não encontrada.'}</p>
            <Link to={`/${region}/fundicoes`} className="text-primary hover:underline font-bold">Voltar para a lista</Link>
        </div>
    );
  }

  const productList = products.filter(p => p.type === 'product');
  const serviceList = products.filter(p => p.type === 'service');

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                <Link to={`/${region}`} className="hover:text-primary transition-colors">{t('home')}</Link>
                <ChevronRight size={12} />
                <Link to={`/${region}/fundicoes`} className="hover:text-primary transition-colors">{t('foundries')}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium truncate">{foundry.name}</span>
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
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=Espa%C3%A7o+Publicit%C3%A1rio"
                />
            </div>
            <div className="block md:hidden">
                <AdSpot 
                    position="top_large_mobile" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=Publicidade"
                />
            </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{foundry.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Excelência em fundição e manufatura industrial.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <a 
                    href={getContactLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-sm font-bold transition-colors shadow-sm uppercase tracking-wide",
                        foundry.whatsapp ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary-hover text-white"
                    )}
                >
                    {foundry.whatsapp ? <MessageCircle size={18} /> : <Mail size={18} />}
                    {foundry.whatsapp ? t('sendWhatsapp') : t('requestQuote')}
                </a>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                    {/* Logo Header */}
                    <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 p-8 relative">
                        {foundry.logoUrl ? (
                            <img 
                                src={foundry.logoUrl} 
                                alt={foundry.name} 
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        ) : (
                            <Factory size={48} className="text-gray-300" />
                        )}
                        {foundry.isVerified && (
                            <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-bl-sm flex items-center gap-1 border-b border-l border-blue-100">
                                <CheckCircle size={10} />
                                {t('verified')}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6">
                        {/* Status & Rating */}
                        <div className="flex justify-between items-center mb-6">
                            <span className={clsx(
                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1",
                                foundry.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                <span className={clsx("w-1.5 h-1.5 rounded-full", foundry.status === 'active' ? "bg-green-600" : "bg-red-600")}></span>
                                {foundry.status === 'active' ? t('active') : t('inactive')}
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-bold text-gray-700">{foundry.rating || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                                <div className="min-w-0">
                                    <span className="block text-xs text-gray-400 font-bold uppercase">{t('location')}</span>
                                    <span className="text-sm text-gray-700 break-words">{foundry.location || '-'}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                                <div className="min-w-0">
                                    <span className="block text-xs text-gray-400 font-bold uppercase">{t('phone')}</span>
                                    <span className="text-sm text-gray-700 break-words">{foundry.phone || '-'}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                                <div className="min-w-0">
                                    <span className="block text-xs text-gray-400 font-bold uppercase">{t('email')}</span>
                                    <span className="text-sm text-gray-700 break-all">{foundry.email || '-'}</span>
                                </div>
                            </div>
                            {foundry.website && (
                                <div className="flex items-start gap-3">
                                    <Globe className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                                    <div className="min-w-0">
                                        <span className="block text-xs text-gray-400 font-bold uppercase">{t('website')}</span>
                                        <a href={foundry.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 break-all">
                                            {t('visitSite')} <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-gray-400">Processo</span>
                                <span className="text-sm font-bold text-gray-800">{foundry.category}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400">{t('memberSince')}</span>
                                <span className="text-sm font-bold text-gray-800">{foundry.joinedDate || 'Jan 2024'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* About Section */}
                <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pl-1 border-l-4 border-primary">{t('about')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {foundry.description || 'Nenhuma descrição disponível.'}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100 mt-6">
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">{foundry.certification || '-'}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Certificação</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">{foundry.yearsExperience || '-'}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Anos</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">{foundry.monthlyCapacity || '-'}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Capacidade/Mês</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">{foundry.marketReach || '-'}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Abrangência</span>
                        </div>
                    </div>
                </div>

                {/* Single Tab Navigation - Matches Supplier Details */}
                {(productList.length > 0 || serviceList.length > 0) && (
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
                )}

                {/* Products & Services Content */}
                {(productList.length > 0 || serviceList.length > 0) && (
                    <div className="space-y-8">
                        {/* Products */}
                        {productList.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">{t('products')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {productList.map(product => (
                                        <div key={product.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-lg transition-all duration-300 group">
                                            <div className="w-28 h-28 bg-gray-100 rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden relative">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate pr-2 flex items-center gap-1">
                                                        <Tag size={10} /> {product.category}
                                                    </span>
                                                    {product.price && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{product.price}</span>}
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-2 truncate group-hover:text-primary transition-colors" title={product.name}>{product.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                                                
                                                {product.linkUrl ? (
                                                    <a 
                                                        href={product.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-auto w-fit text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        {t('viewDetails')} <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <button disabled className="mt-auto w-fit text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-sm cursor-not-allowed">
                                                        {t('viewDetails')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Services */}
                        {serviceList.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">{t('services')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {serviceList.map(service => (
                                        <div key={service.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-lg transition-all duration-300 group">
                                            <div className="w-28 h-28 bg-gray-100 rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden">
                                                {service.image ? (
                                                    <img src={service.image} alt={service.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate pr-2 flex items-center gap-1">
                                                        <Tag size={10} /> {service.category}
                                                    </span>
                                                    {service.price && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{service.price}</span>}
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-2 truncate group-hover:text-primary transition-colors" title={service.name}>{service.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{service.description}</p>
                                                
                                                {service.linkUrl ? (
                                                    <a 
                                                        href={service.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-auto w-fit text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        {t('viewDetails')} <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <button disabled className="mt-auto w-fit text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-sm cursor-not-allowed">
                                                        {t('viewDetails')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Capabilities Grid */}
                {capabilities.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pl-1 border-l-4 border-primary">Capacidades & Serviços</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {capabilities.map((cap, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-sm p-5 hover:shadow-md transition-shadow flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-50 text-primary rounded-sm flex items-center justify-center flex-shrink-0">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{cap.title}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{cap.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gallery Section */}
                {gallery.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 pl-1 border-l-4 border-primary">Galeria de Produtos</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {gallery.map((img, idx) => (
                                <div key={idx} className="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 cursor-pointer border border-gray-200">
                                    <img 
                                        src={img.image_url} 
                                        alt={`Gallery ${idx + 1}`} 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

        </div>
      </main>
    </div>
  );
};

export default FoundryDetails;
