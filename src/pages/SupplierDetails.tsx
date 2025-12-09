import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { suppliers, supplierProducts } from '../data/mockData';
import { ChevronRight, MapPin, Phone, Mail, Globe, Star, MessageSquare, Package, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const SupplierDetails = () => {
  const { id } = useParams();
  
  // Find supplier or fallback to first one for demo if ID not found
  const supplier = suppliers.find(s => s.id === id) || suppliers[0];

  // Filter products and services
  const products = supplierProducts.filter(p => p.type === 'product');
  const services = supplierProducts.filter(p => p.type === 'service');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
        
        {/* Top Ad Banner - 100% Width */}
        <div className="w-full mb-8">
            <div className="bg-gray-200 h-[150px] rounded flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" 
                  alt="MAGMA Engineering" 
                  className="w-full h-full object-cover" 
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
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
                    <MessageSquare size={16} />
                    Enviar Mensagem
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                    {/* Logo Header */}
                    <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 p-8">
                        <img 
                            src={supplier.logoUrl} 
                            alt={supplier.name} 
                            className="w-full h-full object-contain"
                        />
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
                                        <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                                <span className="text-sm font-bold text-gray-800">{supplier.joinedDate || 'Jan 2024'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Sobre a Empresa</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {supplier.description}
                        <br /><br />
                        Comprometida com a excelência e inovação no mercado de alumínio, oferecendo soluções que impulsionam a produtividade e qualidade de nossos parceiros.
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
                    {products.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">Produtos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {products.map(product => (
                                    <div key={product.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-24 h-24 bg-gray-100 rounded-sm flex-shrink-0">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-sm" />
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{product.category}</span>
                                                <span className="text-xs font-bold text-primary">{product.price}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                            <button className="mt-auto w-fit text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-50 transition-colors">
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Section */}
                    {services.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-primary">Serviços</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {services.map(service => (
                                    <div key={service.id} className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-24 h-24 bg-gray-100 rounded-sm flex-shrink-0">
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover rounded-sm" />
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{service.category}</span>
                                                <span className="text-xs font-bold text-primary">{service.price}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">{service.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                                            <button className="mt-auto w-fit text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-50 transition-colors">
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
