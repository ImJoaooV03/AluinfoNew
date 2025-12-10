import React, { useEffect, useState } from 'react';
import { MessageSquare, Download } from 'lucide-react';
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
      const { data } = await supabase
        .from('media_kit_settings')
        .select('file_url')
        .eq('region', region) // Filtro por Região
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
      alert('O Mídia Kit para esta região está sendo atualizado.');
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

  const whatsappLink = "https://api.whatsapp.com/send/?phone=5547996312867&text=Ol%C3%A1%21+Gostaria+de+saber+mais+sobre+oportunidades+de+an%C3%BAncio+no+Portal+Aluinfo.&type=phone_number&app_absent=0";

  return (
    <div className="min-h-screen font-sans">
      <section className="bg-primary py-20 md:py-28 px-4 text-center relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-8">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
                {t('advertiseSubtitle')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('advertiseTitle')}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-white text-primary px-8 py-3.5 rounded-md font-bold flex items-center justify-center gap-2">
              <MessageSquare size={18} /> {t('talkToExpert')}
            </a>
            <button onClick={handleDownloadClick} className="w-full sm:w-auto bg-white/10 border border-white text-white px-8 py-3.5 rounded-md font-bold flex items-center justify-center gap-2">
              <Download size={18} /> {t('downloadMediaKit')}
            </button>
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
