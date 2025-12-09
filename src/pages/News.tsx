import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mainNews, sidebarAds } from '../data/mockData';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import NewsletterWidget from '../components/NewsletterWidget';
import { Search, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';

const NewsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {/* Featured Skeleton */}
    <div className="h-[300px] md:h-[400px] bg-gray-200 rounded-sm w-full"></div>
    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-80 bg-gray-200 rounded-sm"></div>
      ))}
    </div>
  </div>
);

const News = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate data fetching delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate pagination/filtering
  const featuredNews = mainNews[0];
  const newsList = mainNews.slice(1);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Notícias</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        
        {/* Top Ad Banner - Matches Home Page */}
        <div className="w-full mb-8">
            <div className="bg-gray-200 h-[150px] rounded flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" 
                  alt="MAGMA Engineering" 
                  className="w-full h-full object-cover" 
                />
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
                <p className="text-sm text-gray-500 mt-1">Acompanhe as últimas atualizações do mercado de alumínio.</p>
            </div>
            
            {/* Search Filter */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Filtrar notícias..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
                
                {isLoading ? (
                    <NewsSkeleton />
                ) : (
                    <>
                        {/* Featured News - Banner Style */}
                        <section>
                            <Link to={`/noticia/${featuredNews.id}`} className="block group relative rounded-sm overflow-hidden shadow-md h-[300px] md:h-[400px]">
                                <img 
                                    src={featuredNews.imageUrl} 
                                    alt={featuredNews.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full md:w-3/4">
                                    <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase mb-3">
                                        Destaque
                                    </span>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-primary-hover transition-colors">
                                        {featuredNews.title}
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs text-gray-300">
                                        <span>{featuredNews.date}</span>
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        <span>{featuredNews.author}</span>
                                    </div>
                                </div>
                            </Link>
                        </section>

                        {/* News Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {newsList.map(news => (
                                <Link to={`/noticia/${news.id}`} key={news.id} className="block h-full">
                                    <NewsCard item={news} variant="highlight" />
                                </Link>
                            ))}
                            {/* Duplicating for demo purposes to fill grid */}
                            {newsList.map(news => (
                                <Link to={`/noticia/${news.id}_dup`} key={`${news.id}_dup`} className="block h-full">
                                    <NewsCard item={news} variant="highlight" />
                                </Link>
                            ))}
                        </section>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-200">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold text-sm">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm">3</button>
                            <span className="text-gray-400">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm">10</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}

            </div>

            {/* Sidebar - Matches Home Page Exactly */}
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
    </div>
  );
};

export default News;
