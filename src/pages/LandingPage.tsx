import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { logoUrl } = useRegion(); // Usa a logo dinâmica (padrão PT se estiver na raiz)

  const regions = [
    { 
      id: 'pt', 
      label: 'Brasil', 
      flag: '🇧🇷', 
      lang: 'Português',
      description: 'Notícias e mercado brasileiro'
    },
    { 
      id: 'mx', 
      label: 'México', 
      flag: '🇲🇽', 
      lang: 'Español',
      description: 'Noticias y mercado mexicano'
    },
    { 
      id: 'en', 
      label: 'Global', 
      flag: '🇺🇸', 
      lang: 'English',
      description: 'International market news'
    },
  ];

  const selectRegion = (regionId: string) => {
    navigate(`/${regionId}`);
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-black z-0" />
      <div 
        className="absolute inset-0 opacity-20 z-0 mix-blend-overlay"
        style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)'
        }}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={logoUrl || "/logo.png"} 
            alt="AluInfo" 
            className="h-20 w-auto mx-auto mb-6 object-contain"
            onError={(e) => {
                // Fallback para texto se a imagem falhar
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* Fallback Text (Hidden by default) */}
          <div id="logo-fallback" className="hidden text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">A</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ALUINFO</h1>
          </div>

          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest flex items-center justify-center gap-2">
            <Globe size={12} /> Select your region
          </p>
        </div>

        {/* Region Buttons */}
        <div className="space-y-3">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRegion(r.id)}
              className="group w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl filter drop-shadow-md">{r.flag}</span>
                <div className="text-left">
                  <span className="block text-white font-bold text-base group-hover:text-primary transition-colors">
                    {r.label}
                  </span>
                  <span className="block text-gray-500 text-xs">
                    {r.lang}
                  </span>
                </div>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px]">
            &copy; 2025 AluInfo Portal. Global Aluminum Market Intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
