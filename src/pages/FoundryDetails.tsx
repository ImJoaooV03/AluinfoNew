import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { foundries } from '../data/mockData';
import { ChevronRight, MapPin, Phone, Mail, Globe, CheckCircle, Layers, Settings, ShieldCheck, Star, ExternalLink, Factory, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

const FoundryDetails = () => {
  const { id } = useParams();
  const foundry = foundries.find(f => f.id === id) || foundries[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Mock data for rich sections
  const capabilities = [
    { icon: <Layers size={20} />, title: "Injeção sob Pressão", description: "Células automatizadas de 400t a 1200t." },
    { icon: <Settings size={20} />, title: "Usinagem CNC", description: "Acabamento de precisão 5 eixos." },
    { icon: <ShieldCheck size={20} />, title: "Controle de Qualidade", description: "Laboratório completo e Raio-X." },
    { icon: <Factory size={20} />, title: "Tratamento Térmico", description: "Processos T6 e T7." },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531297461136-82lwDe83a9?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622466023389-1055823122f3?q=80&w=600&auto=format&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <Link to="/fundicoes" className="hover:text-primary transition-colors">Fundições</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium truncate">{foundry.name}</span>
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{foundry.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Excelência em fundição e manufatura industrial.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-sm text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm uppercase tracking-wide">
                    <Mail size={16} />
                    Solicitar Cotação
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                    {/* Logo Header */}
                    <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 p-8 relative">
                        <img 
                            src={foundry.logoUrl} 
                            alt={foundry.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                        {foundry.isVerified && (
                            <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-bl-sm flex items-center gap-1 border-b border-l border-blue-100">
                                <CheckCircle size={10} />
                                VERIFICADO
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
                                {foundry.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-bold text-gray-700">{foundry.rating || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">Localização</span>
                                    <span className="text-sm text-gray-700">{foundry.location}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">Telefone</span>
                                    <span className="text-sm text-gray-700">{foundry.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold uppercase">E-mail</span>
                                    <span className="text-sm text-gray-700">{foundry.email}</span>
                                </div>
                            </div>
                            {foundry.website && (
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
                                <span className="block text-xs text-gray-400">Processo</span>
                                <span className="text-sm font-bold text-gray-800">{foundry.category}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400">Membro desde</span>
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
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pl-1 border-l-4 border-primary">Sobre a Fundição</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {foundry.description}
                        <br /><br />
                        Nossa empresa se destaca pela capacidade técnica e compromisso com a qualidade. Contamos com um parque fabril moderno e equipe altamente qualificada para atender as demandas mais exigentes do mercado, desde a prototipagem até a produção em larga escala.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">ISO</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Certificação</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">25+</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Anos</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">500t</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Capacidade/Mês</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-sm">
                            <span className="block text-xl font-bold text-primary">100%</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Nacional</span>
                        </div>
                    </div>
                </div>

                {/* Capabilities Grid */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pl-1 border-l-4 border-primary">Capacidades & Serviços</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {capabilities.map((cap, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-sm p-5 hover:shadow-md transition-shadow flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange-50 text-primary rounded-sm flex items-center justify-center flex-shrink-0">
                                    {cap.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{cap.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{cap.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gallery Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 pl-1 border-l-4 border-primary">Galeria de Produtos</h3>
                        <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            Ver todas <ChevronRight size={12} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((img, idx) => (
                            <div key={idx} className="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 cursor-pointer border border-gray-200">
                                <img 
                                    src={img} 
                                    alt={`Product ${idx + 1}`} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
};

export default FoundryDetails;
