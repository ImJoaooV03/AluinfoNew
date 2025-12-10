import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Newspaper, BookOpen, Users, Factory, Megaphone, Linkedin, Instagram, Calendar, Globe } from 'lucide-react';
import clsx from 'clsx';
import { useRegion } from '../contexts/RegionContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { region, changeRegion, t } = useRegion();

  const navItems = [
    { label: t('home'), icon: <Home size={16} />, path: '' }, // Path relativo
    { label: t('news'), icon: <Newspaper size={16} />, path: 'noticias' },
    { label: t('technical'), icon: <BookOpen size={16} />, path: 'artigos-tecnicos' },
    { label: t('ebooks'), icon: <BookOpen size={16} />, path: 'ebooks' },
    { label: t('events'), icon: <Calendar size={16} />, path: 'eventos' },
    { label: t('suppliers'), icon: <Users size={16} />, path: 'fornecedores' },
    { label: t('foundries'), icon: <Factory size={16} />, path: 'fundicoes' },
    { label: t('advertise'), icon: <Megaphone size={16} />, path: 'anuncie' },
  ];

  const isActive = (path: string) => {
    const fullPath = `/${region}${path ? '/' + path : ''}`;
    if (path === '') {
      return location.pathname === `/${region}` || location.pathname === `/${region}/`;
    }
    return location.pathname.startsWith(fullPath);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/${region}/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-[#1a1a1a] text-white text-[11px] py-1.5 border-b border-gray-800 relative z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="hidden md:inline text-gray-400">Portal Global do Mercado de Alumínio</span>
          <div className="flex items-center gap-4 ml-auto">
             
             {/* Region Selector */}
             <div className="flex items-center gap-2 border-r border-gray-700 pr-4 mr-2">
                <Globe size={12} className="text-gray-400" />
                <button 
                    onClick={() => changeRegion('pt')} 
                    className={clsx("hover:text-primary transition-colors font-bold", region === 'pt' ? "text-primary" : "text-gray-400")}
                >
                    BR
                </button>
                <button 
                    onClick={() => changeRegion('mx')} 
                    className={clsx("hover:text-primary transition-colors font-bold", region === 'mx' ? "text-primary" : "text-gray-400")}
                >
                    MX
                </button>
                <button 
                    onClick={() => changeRegion('en')} 
                    className={clsx("hover:text-primary transition-colors font-bold", region === 'en' ? "text-primary" : "text-gray-400")}
                >
                    EN
                </button>
             </div>

             <div className="flex items-center gap-2 text-gray-400 border-r border-gray-700 pr-4">
                <a href="https://www.linkedin.com/in/portal-aluinfo-231955374/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin size={12} /></a>
                <a href="https://www.instagram.com/portal.aluinfo" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Instagram size={12} /></a>
             </div>
             <Link to={`/${region}/anuncie`} className="hover:text-primary transition-colors">Anuncie Conosco</Link>
          </div>
        </div>
      </div>

      {/* Sticky Container */}
      <div className="sticky top-0 z-50 shadow-xl flex flex-col w-full">
          
          {/* Main Header Area (Logo & Search) */}
          <div className="bg-[#222222] py-4 md:py-5">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo */}
              <Link to={`/${region}`} className="flex items-center gap-3 flex-shrink-0 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                      A
                  </div>
                  <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white tracking-tight leading-none group-hover:text-gray-200 transition-colors">ALUINFO</span>
                      <span className="text-[10px] text-gray-400 tracking-widest uppercase font-medium">
                        {region === 'pt' ? 'PORTAL DE NOTÍCIAS' : region === 'mx' ? 'PORTAL DE NOTICIAS' : 'NEWS PORTAL'}
                      </span>
                  </div>
              </Link>

              {/* Search Bar */}
              <div className="w-full md:w-auto flex-grow max-w-xl">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                    <input 
                        type="text" 
                        placeholder={t('search') + "..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-4 pr-32 rounded-md bg-white text-base text-gray-600 placeholder-gray-400 focus:outline-none shadow-sm"
                    />
                    <button 
                        type="submit"
                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#E87736] hover:bg-[#d66620] text-white px-6 rounded text-sm font-bold uppercase transition-colors tracking-wide flex items-center justify-center"
                    >
                        {t('search')}
                    </button>
                </form>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="bg-[#2c2c2c] border-t border-gray-700 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between md:hidden py-3">
                    <span className="text-white font-bold text-sm">MENU</span>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-1 hover:bg-white/10 rounded transition-colors">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                <nav className={clsx(
                    "md:flex items-center gap-1 overflow-x-auto scrollbar-hide",
                    isMenuOpen ? "flex flex-col py-2 border-t border-gray-700 md:border-t-0" : "hidden"
                )}>
                    {navItems.map((item, idx) => (
                        <Link 
                            key={idx} 
                            to={`/${region}/${item.path}`} 
                            className={clsx(
                                "flex items-center gap-2 px-5 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 md:border-b-0 md:border-t-2",
                                isActive(item.path)
                                    ? "bg-primary text-white border-primary md:border-t-primary" 
                                    : "border-transparent text-gray-300 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <span className={clsx(isActive(item.path) ? "text-white" : "text-primary")}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
          </div>
      </div>
    </>
  );
};

export default Header;
