import React, { useEffect, useState } from 'react';
import { MessageSquare, Download, Users, Globe, MousePointer, Layout, Mail, FileText, CheckCircle } from 'lucide-react';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

const Advertise = () => {
  const { region, t } = useRegion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaKitUrl, setMediaKitUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMediaKitUrl();
  }, [region]);

  const fetchMediaKitUrl = async () => {
    try {
      // Busca na tabela correta 'media_kit_settings'
      const { data } = await supabase
        .from('media_kit_settings')
        .select('file_url')
        .eq('region', region)
        .maybeSingle();
      
      if (data && data.file_url) {
        setMediaKitUrl(data.file_url);
      } else {
        setMediaKitUrl(null);
      }
    } catch (error) {
      console.error('Erro ao buscar mídia kit:', error);
    }
  };

  const handleDownloadClick = () => {
    if (!mediaKitUrl) {
      alert(region === 'pt' ? 'O Mídia Kit está sendo atualizado. Tente novamente mais tarde.' : region === 'mx' ? 'El Media Kit se está actualizando.' : 'Media Kit is being updated.');
      // Tenta buscar novamente caso tenha acabado de ser enviado
      fetchMediaKitUrl();
      return;
    }
    setIsModalOpen(true);
  };

  const handleLeadSubmit = async (email: string) => {
    if (mediaKitUrl) {
      const link = document.createElement('a');
      link.href = mediaKitUrl;
      link.target = '_blank';
      link.download = `AluInfo_Midia_Kit_${region.toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Traduções Locais para Conteúdo Rico
  const content = {
    pt: {
      statsTitle: "Por que anunciar no AluInfo?",
      statsDesc: "Somos o maior portal dedicado exclusivamente ao mercado de alumínio na região. Conectamos sua marca aos principais decisores, engenheiros e compradores do setor.",
      formatsTitle: "Formatos de Publicidade",
      formatsDesc: "Oferecemos diversas opções para destacar sua marca e atingir seus objetivos de marketing.",
      formats: [
        { title: "Banners Display", desc: "Visibilidade garantida em áreas nobres do site (Topo, Lateral e Meio).", icon: Layout },
        { title: "Newsletter", desc: "Sua marca diretamente na caixa de entrada de milhares de inscritos qualificados.", icon: Mail },
        { title: "Conteúdo Patrocinado", desc: "Artigos técnicos e publieditoriais para demonstrar autoridade no assunto.", icon: FileText }
      ],
      ctaTitle: "Pronto para impulsionar seus resultados?",
      ctaDesc: "Entre em contato com nossa equipe comercial e solicite uma proposta personalizada.",
      ctaButton: "Solicitar Proposta",
      whatsappText: "Olá! Gostaria de saber mais sobre oportunidades de anúncio no Portal Aluinfo."
    },
    mx: {
      statsTitle: "¿Por qué anunciarse en AluInfo?",
      statsDesc: "Somos el mayor portal dedicado exclusivamente al mercado del aluminio en la región. Conectamos su marca con los principales tomadores de decisiones, ingenieros y compradores del sector.",
      formatsTitle: "Formatos de Publicidad",
      formatsDesc: "Ofrecemos diversas opciones para destacar su marca y alcanzar sus objetivos de marketing.",
      formats: [
        { title: "Banners Display", desc: "Visibilidad garantizada en áreas privilegiadas del sitio (Superior, Lateral y Medio).", icon: Layout },
        { title: "Boletín Informativo", desc: "Su marca directamente en la bandeja de entrada de miles de suscriptores calificados.", icon: Mail },
        { title: "Contenido Patrocinado", desc: "Artículos técnicos y publirreportajes para demostrar autoridad en el tema.", icon: FileText }
      ],
      ctaTitle: "¿Listo para impulsar sus resultados?",
      ctaDesc: "Póngase en contacto con nuestro equipo comercial y solicite una propuesta personalizada.",
      ctaButton: "Solicitar Propuesta",
      whatsappText: "¡Hola! Me gustaría saber más sobre oportunidades de anuncio en el Portal Aluinfo."
    },
    en: {
      statsTitle: "Why advertise on AluInfo?",
      statsDesc: "We are the largest portal dedicated exclusively to the aluminum market in the region. We connect your brand to key decision-makers, engineers, and buyers in the sector.",
      formatsTitle: "Advertising Formats",
      formatsDesc: "We offer various options to highlight your brand and achieve your marketing goals.",
      formats: [
        { title: "Display Banners", desc: "Guaranteed visibility in prime areas of the site (Top, Sidebar, and Middle).", icon: Layout },
        { title: "Newsletter", desc: "Your brand directly in the inbox of thousands of qualified subscribers.", icon: Mail },
        { title: "Sponsored Content", desc: "Technical articles and advertorials to demonstrate authority on the subject.", icon: FileText }
      ],
      ctaTitle: "Ready to boost your results?",
      ctaDesc: "Contact our sales team and request a personalized proposal.",
      ctaButton: "Request Proposal",
      whatsappText: "Hello! I would like to know more about advertising opportunities on the Aluinfo Portal."
    }
  };

  const currentContent = content[region as keyof typeof content] || content.pt;
  
  // Link do WhatsApp com mensagem dinâmica
  const whatsappLink = `https://api.whatsapp.com/send/?phone=5547996312867&text=${encodeURIComponent(currentContent.whatsappText)}&type=phone_number&app_absent=0`;

  return (
    <div className="min-h-screen font-sans bg-white">
      
      {/* Hero Section */}
      <section className="bg-primary py-20 md:py-28 px-4 text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
                {t('advertiseSubtitle')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            {t('advertiseTitle')}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 px-8 py-3.5 rounded-md font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <MessageSquare size={18} /> {t('talkToExpert')}
            </a>
            <button onClick={handleDownloadClick} className="w-full sm:w-auto bg-white/10 border border-white text-white hover:bg-white/20 px-8 py-3.5 rounded-md font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
              <Download size={18} /> {t('downloadMediaKit')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section (Modified: Cards removed, text centered) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {currentContent.statsTitle}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                    {currentContent.statsDesc}
                </p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-4">
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
                        <CheckCircle className="text-primary" size={20} />
                        <span className="font-medium">Networking qualificado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
                        <CheckCircle className="text-primary" size={20} />
                        <span className="font-medium">Autoridade no mercado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
                        <CheckCircle className="text-primary" size={20} />
                        <span className="font-medium">Alcance global</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Formats Section */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentContent.formatsTitle}</h2>
                <p className="text-gray-600">{currentContent.formatsDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {currentContent.formats.map((format, idx) => {
                    const Icon = format.icon;
                    return (
                        <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{format.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {format.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <div className="bg-[#1a1a1a] rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        {currentContent.ctaTitle}
                    </h2>
                    <p className="text-gray-400 mb-10 text-lg">
                        {currentContent.ctaDesc}
                    </p>
                    <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-md font-bold text-lg transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1"
                    >
                        <MessageSquare size={20} />
                        {currentContent.ctaButton}
                    </a>
                </div>
            </div>
        </div>
      </section>
      
      {/* Lead Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLeadSubmit}
        title={`Mídia Kit AluInfo ${region.toUpperCase()}`}
        source="media-kit"
      />
    </div>
  );
};

export default Advertise;
