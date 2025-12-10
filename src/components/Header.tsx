import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Newspaper, BookOpen, Users, Factory, Megaphone, Linkedin, Instagram, Calendar } from 'lucide-react';
import clsx from 'clsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Início', icon: <Home size={16} />, path: '/' },
    { label: 'Notícias', icon: <Newspaper size={16} />, path: '/noticias' },
    { label: 'Artigos Técnicos', icon: <BookOpen size={16} />, path: '/artigos-tecnicos' },
    { label: 'E-books', icon: <BookOpen size={16} />, path: '/ebooks' },
    { label: 'Eventos', icon: <Calendar size={16} />, path: '/eventos' },
    { label: 'Fornecedores', icon: <Users size={16} />, path: '/fornecedores' },
    { label: 'Fundições', icon: <Factory size={16} />, path: '/fundicoes' },
    { label: 'Anuncie', icon: <Megaphone size={16} />, path: '/anuncie' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false); // Fecha o menu mobile se estiver aberto
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-[#1a1a1a] text-white text-[11px] py-1.5 border-b border-gray-800 relative z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="hidden md:inline text-gray-400">Portal Global do Mercado de Alumínio</span>
          <div className="flex items-center gap-4 ml-auto">
             <div className="flex items-center gap-2 text-gray-400 border-r border-gray-700 pr-4">
                <a href="https://www.linkedin.com/in/portal-aluinfo-231955374/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin size={12} /></a>
                <a href="https://www.instagram.com/portal.aluinfo" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Instagram size={12} /></a>
             </div>
             <Link to="/anuncie" className="hover:text-primary transition-colors">Anuncie Conosco</Link>
          </div>
        </div>
      </div>

      {/* Sticky Container */}
      <div className="sticky top-0 z-50 shadow-xl flex flex-col w-full">
          
          {/* Main Header Area (Logo & Search) */}
          <div className="bg-[#222222] py-4 md:py-5">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                      A
                  </div>
                  <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white tracking-tight leading-none group-hover:text-gray-200 transition-colors">ALUINFO</span>
                      <span className="text-[10px] text-gray-400 tracking-widest uppercase font-medium">PORTAL DE NOTÍCIAS</span>
                  </div>
              </Link>

              {/* Search Bar - Pixel Perfect Match based on Image */}
              <div className="w-full md:w-auto flex-grow max-w-xl">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                    <input 
                        type="text" 
                        placeholder="Buscar no portal..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-4 pr-32 rounded-md bg-white text-base text-gray-600 placeholder-gray-400 focus:outline-none shadow-sm"
                    />
                    <button 
                        type="submit"
                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#E87736] hover:bg-[#d66620] text-white px-6 rounded text-sm font-bold uppercase transition-colors tracking-wide flex items-center justify-center"
                    >
                        BUSCAR
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
                            to={item.path} 
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
