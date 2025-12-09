import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import HeroCarousel from '../components/HeroCarousel';
import NewsletterWidget from '../components/NewsletterWidget';
import SupplierCard from '../components/SupplierCard';
import FoundryCard from '../components/FoundryCard';
import { mainNews, technicalMaterials, ebooks, events, sidebarAds, suppliers, foundries } from '../data/mockData';
import { Wrench, Book, Calendar, TrendingUp, Users, Factory } from 'lucide-react';

const Home = () => {
  // Slice data for the mixed grid layout
  const highlightNews = mainNews.slice(0, 2);
  const secondaryNews = mainNews.slice(2, 6);

  // Filter verified suppliers for the new section - Limit changed to 3
  const verifiedSuppliers = suppliers.filter(s => s.isVerified).slice(0, 3);

  // Filter verified foundries, reverse to get "latest" (assuming array order), and slice 3
  const verifiedFoundries = foundries
    .filter(f => f.isVerified)
    .slice(0, 3); // Taking first 3 verified for display

  // Slice technical materials to show only the latest 3
  const latestTechnicalMaterials = technicalMaterials.slice(0, 3);

  return (
    <>
      {/* Hero Carousel Area */}
      <HeroCarousel />

      <main className="container mx-auto px-4 py-8">
        
        {/* Top Ad Banners - Single Full Width Banner with 150px height */}
        <div className="w-full mb-8">
            <div className="bg-gray-200 h-[150px] rounded flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" 
                  alt="MAGMA Engineering" 
                  className="w-full h-full object-cover" 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-9 space-y-12">
                
                {/* Latest News Section - Mixed Grid */}
                <section>
                    <SectionHeader title="Últimas Notícias" />
                    
                    {/* Top Row: 2 Large Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {highlightNews.map(news => (
                            <Link to={`/noticia/${news.id}`} key={news.id} className="block h-full">
                                <NewsCard item={news} variant="highlight" />
                            </Link>
                        ))}
                    </div>

                    {/* Bottom Row: 4 Smaller Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {secondaryNews.map(news => (
                            <Link to={`/noticia/${news.id}`} key={news.id} className="block h-full">
                                <NewsCard item={news} variant="compact" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Banner Middle */}
                <div className="w-full h-[150px] bg-gray-300 rounded overflow-hidden">
                     <img src="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/555555/ffffff?text=WALBERT+Modelacao+e+Ferramentaria" className="w-full h-full object-cover" />
                </div>

                {/* Verified Suppliers Section */}
                <section>
                    <SectionHeader title="Fornecedores em Destaque" icon={<Users size={20} />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verifiedSuppliers.map(supplier => (
                            <SupplierCard key={supplier.id} supplier={supplier} hideLogo={true} hideContactInfo={true} />
                        ))}
                    </div>
                </section>

                {/* Verified Foundries Section - NEW */}
                <section>
                    <SectionHeader title="Fundições em Destaque" icon={<Factory size={20} />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verifiedFoundries.map(foundry => (
                            <FoundryCard key={foundry.id} foundry={foundry} hideLogo={true} hideContactInfo={true} />
                        ))}
                    </div>
                </section>

                {/* Technical Materials Section */}
                <section>
                    <SectionHeader title="Materiais Técnicos" icon={<Wrench size={20} />} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {latestTechnicalMaterials.map(item => (
                            <NewsCard key={item.id} item={item} variant="technical" />
                        ))}
                    </div>
                </section>

                {/* Banner Middle 2 */}
                <div className="w-full h-[150px] bg-amber-100 rounded overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-4xl font-bold text-white drop-shadow-lg uppercase">Automatic</h2>
                    </div>
                </div>

                {/* E-books Section */}
                <section>
                    <SectionHeader title="E-books" icon={<Book size={20} />} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ebooks.map(item => (
                            <NewsCard key={item.id} item={item} variant="ebook" />
                        ))}
                    </div>
                </section>

                {/* Banner Moved Here (Above Events) */}
                <div className="w-full h-[150px] bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-xl uppercase tracking-widest">Sua Empresa Com...</span>
                </div>

                {/* Events Section */}
                <section>
                    <SectionHeader title="Eventos" icon={<Calendar size={20} />} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {events.map(item => (
                            <NewsCard key={item.id} item={item} variant="event" />
                        ))}
                    </div>
                </section>

            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-3 space-y-6">
                
                {/* LME Indicators Widget */}
                <div className="w-full">
                     <SectionHeader title="Indicadores LME" icon={<TrendingUp size={20} />} hasButton={false} />
                     <div className="bg-white border border-gray-200 p-4 rounded-sm w-full shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">ALUMÍNIO</h4>
                                <span className="text-xs text-gray-500">AL</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900 text-lg">$2868.00</div>
                                <div className="text-[11px] text-green-600 font-bold">+1.40%</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
                            1 de dezembro de 2025
                        </div>
                     </div>
                </div>

                {sidebarAds.map((ad, index) => (
                    <React.Fragment key={ad.id}>
                        {/* Insert Newsletter before the 3rd ad (index 2) which is AluInfo Ads */}
                        {index === 2 && <NewsletterWidget />}
                        
                        <div className="bg-white border border-gray-200 p-1 rounded-sm shadow-sm">
                            <img 
                                src={ad.imageUrl} 
                                alt={ad.alt} 
                                className="w-full h-[150px] object-cover rounded-sm" 
                            />
                        </div>
                    </React.Fragment>
                ))}
                
                {/* Most Read Widget */}
                <div className="bg-white border border-gray-200 p-4 rounded-sm w-full">
                     <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-sm">Mais Lidas</h3>
                     <ul className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <li key={i} className="flex gap-3 items-start group cursor-pointer">
                                <span className="text-2xl font-bold text-gray-200 leading-none group-hover:text-primary transition-colors">{i}</span>
                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-900">
                                    Tendências do mercado de alumínio para o próximo semestre mostram crescimento...
                                </p>
                            </li>
                        ))}
                     </ul>
                </div>
            </aside>

        </div>
      </main>
    </>
  );
};

export default Home;
