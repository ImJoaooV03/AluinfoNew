import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { Search, ChevronRight, ChevronLeft, Loader2, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { NewsItem } from '../types';
import { useRegion } from '../contexts/RegionContext';

const NewsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-[300px] md:h-[400px] bg-gray-200 rounded-sm w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-80 bg-gray-200 rounded-sm"></div>
      ))}
    </div>
  </div>
);

const News = () => {
  const { region, t } = useRegion();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, [region]); // Recarregar quando a região mudar

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .eq('region', region) // Filtro por Região
        .order('publish_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedNews: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          date: new Date(item.publish_date).toLocaleDateString(region === 'pt' ? 'pt-BR' : region === 'mx' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          author: item.author,
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
          isHighlight: item.is_highlight,
          type: 'news'
        }));
        setNews(mappedNews);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const newsList = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to={`/${region}`} className="hover:text-primary transition-colors">{t('home')}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">{t('news')}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        
        {/* Banner Topo Grande (Global) */}
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot 
                    position="top_large" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
                />
            </div>
            <div className="block md:hidden">
                <AdSpot 
                    position="top_large_mobile" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile"
                />
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('news')}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {region === 'pt' ? 'Acompanhe as últimas atualizações do mercado.' : 
                     region === 'mx' ? 'Siga las últimas actualizaciones del mercado.' : 
                     'Follow the latest market updates.'}
                </p>
            </div>
            
            {/* Search Filter */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder={t('search') + "..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                ) : filteredNews.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <p className="text-gray-500">Nenhuma notícia encontrada.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured News - Banner Style */}
                        {featuredNews && (
                            <section>
                                <Link to={`/${region}/noticia/${featuredNews.id}`} className="block group relative rounded-sm overflow-hidden shadow-md h-[300px] md:h-[400px]">
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
                        )}

                        {/* News Grid */}
                        {newsList.length > 0 && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {newsList.map(news => (
                                    <Link to={`/${region}/noticia/${news.id}`} key={news.id} className="block h-full">
                                        <NewsCard item={news} variant="highlight" />
                                    </Link>
                                ))}
                            </section>
                        )}
                    </>
                )}

            </div>

            {/* Sidebar (Global) */}
            <SidebarAds mostReadNews={news.slice(0, 4)} />

        </div>
      </main>
    </div>
  );
};

export default News;
