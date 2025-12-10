import React, { useEffect, useState } from 'react';
import { MessageSquare, Download, Globe, Target, Award, BarChart3, Zap } from 'lucide-react';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { supabase } from '../lib/supabaseClient';

const Advertise = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaKitUrl, setMediaKitUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMediaKitUrl();
  }, []);

  const fetchMediaKitUrl = async () => {
    try {
      const { data } = await supabase
        .from('media_kit_settings')
        .select('file_url')
        .eq('id', 1)
        .single();
      
      if (data && data.file_url) {
        setMediaKitUrl(data.file_url);
      }
    } catch (error) {
      console.error('Erro ao buscar mídia kit:', error);
    }
  };

  const handleDownloadClick = () => {
    if (!mediaKitUrl) {
      alert('O Mídia Kit está sendo atualizado. Tente novamente mais tarde.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleLeadSubmit = async (email: string) => {
    if (mediaKitUrl) {
      const link = document.createElement('a');
      link.href = mediaKitUrl;
      link.target = '_blank';
      link.download = 'AluInfo_Midia_Kit.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const whatsappLink = "https://api.whatsapp.com/send/?phone=5547996312867&text=Ol%C3%A1%21+Gostaria+de+saber+mais+sobre+oportunidades+de+an%C3%BAncio+no+Portal+Aluinfo.&type=phone_number&app_absent=0";

  return (
    <div className="min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="bg-primary py-20 md:py-28 px-4 text-center relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-8">
            <span className="text-white text-xs font-bold uppercase tracking-wider">Oportunidades de Publicidade</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Anuncie no Portal <br /> Aluinfo
          </h1>
          
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Conecte-se com profissionais da indústria do alumínio e fundição. Maximize sua visibilidade no maior portal especializado do setor.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 px-8 py-3.5 rounded-md font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
              Fale com um Especialista
            </a>
            <button 
              onClick={handleDownloadClick}
              className="w-full sm:w-auto bg-white/10 border border-white text-white hover:bg-white hover:text-primary px-8 py-3.5 rounded-md font-bold transition-all flex items-center justify-center gap-2 group backdrop-blur-sm"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              Baixe o Mídia Kit
            </button>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Column */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">O Portal Aluinfo</h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                Somos a principal referência em informações sobre alumínio e fundição no Brasil. Nosso portal conecta fornecedores, fundições, profissionais e empresas do setor, oferecendo conteúdo especializado e oportunidades de negócio.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Alcance nacional e internacional</h3>
                    <p className="text-sm text-gray-500">Presença consolidada em todo o território brasileiro e conexões globais.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Público altamente segmentado</h3>
                    <p className="text-sm text-gray-500">Engenheiros, gestores, compradores e decisores da indústria.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Autoridade reconhecida no setor</h3>
                    <p className="text-sm text-gray-500">Credibilidade construída através de conteúdo técnico de alta qualidade.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Box */}
            <div className="bg-[#FFF8F3] rounded-2xl p-8 md:p-10 border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Por que escolher o Aluinfo?</h3>
              <ul className="space-y-4">
                {[
                  'Audiência qualificada e engajada',
                  'Conteúdo técnico especializado',
                  'Plataforma confiável e estabelecida',
                  'ROI comprovado para anunciantes',
                  'Suporte dedicado para campanhas'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Ad Formats Section */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Formatos de Anúncio Disponíveis</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Oferecemos diversas opções para destacar sua marca e atingir seus objetivos de marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Banner Display</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Anúncios visuais em posições estratégicas do site para máxima exposição da marca.
              </p>
              <ul className="space-y-3">
                {[
                  'Alta visibilidade',
                  'Formato responsivo',
                  'Relatórios detalhados'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors relative z-10">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">Conteúdo Patrocinado</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10">
                Artigos e conteúdos promocionais integrados editorialmente para engajamento profundo.
              </p>
              <ul className="space-y-3 relative z-10">
                {[
                  'Engajamento natural',
                  'SEO otimizado',
                  'Credibilidade'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Newsletter</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Espaços publicitários na nossa newsletter semanal enviada para milhares de assinantes.
              </p>
              <ul className="space-y-3">
                {[
                  'Público qualificado',
                  'Alta taxa de abertura',
                  'Segmentação'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para Impulsionar seu Negócio?
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos ajudar sua empresa a alcançar novos patamares no mercado do alumínio.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 px-8 py-3.5 rounded-md font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Fale com um Especialista
            </a>
            <button 
              onClick={handleDownloadClick}
              className="w-full sm:w-auto bg-white/10 border border-white text-white hover:bg-white hover:text-primary px-8 py-3.5 rounded-md font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Download size={18} />
              Baixe o Mídia Kit
            </button>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLeadSubmit}
        title="Mídia Kit AluInfo 2025"
        source="media-kit"
      />

    </div>
  );
};

export default Advertise;
