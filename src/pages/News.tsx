import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { Search, ChevronRight, Loader2, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { NewsItem } from '../types';
import { useRegion } from '../contexts/RegionContext';

const NewsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-[400px] bg-gray-200 rounded-xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-96 bg-gray-200 rounded-sm"></div>
      ))}
    </div>
  </div>
);

const News = () => {
  const { region, t } = useRegion();
  const [highlights, setHighlights] = useState<NewsItem[]>([]);
  const [regularNews, setRegularNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, [region]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      // Busca todas as notícias publicadas
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .eq('region', region)
        .order('publish_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedNews: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          date: new Date(item.publish_date).toLocaleDateString(
            region === 'pt' ? 'pt-BR' : region === 'mx' ? 'es-MX' : 'en-US', 
            { day: '2-digit', month: 'short', year: 'numeric' }
          ),
          author: item.author || 'AluInfo',
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
          isHighlight: item.is_highlight,
          type: 'news'
        }));

        // Mantemos a separação inicial apenas para priorizar destaques no topo da lista combinada
        const highlightItems = mappedNews.filter(item => item.isHighlight);
        const regularItems = mappedNews.filter(item => !item.isHighlight);

        setHighlights(highlightItems);
        setRegularNews(regularItems);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de filtro
  const filterItem = (item: NewsItem) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredHighlights = highlights.filter(filterItem);
  const filteredRegular = regularNews.filter(filterItem);

  // Lógica de Unificação: Destaques primeiro, depois notícias gerais
  const allContent = [...filteredHighlights, ...filteredRegular];

  // Separação para Layout: Hero (Index 0) vs Grid (Resto)
  const heroItem = allContent[0];
  const gridItems = allContent.slice(1);

  const hasAnyNews = allContent.length > 0;

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
        
        {/* Banner Topo Grande */}
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot 
                    position="top_large" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
                />
            </div>
            <div className="block md:hidden">
                <AdSpot 
                    position="top_large_mobile" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile"
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
            <div className="lg:col-span-9 space-y-10">
                
                {isLoading ? (
                    <NewsSkeleton />
                ) : !hasAnyNews ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Nenhuma notícia encontrada.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Hero Principal (Index 0) */}
                        {heroItem && (
                            <section>
                                <Link to={`/${region}/noticia/${heroItem.id}`} className="block group relative rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
                                    <img 
                                        src={heroItem.imageUrl} 
                                        alt={heroItem.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Gradiente escuro para legibilidade */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    
                                    <div className="absolute top-6 left-6 md:left-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                <img src="https://i.ibb.co/HLfD5wgf/dualite-favicon.png" alt="Logo" className="w-6 h-6 object-contain" />
                                            </div>
                                            <div className="text-white font-bold leading-tight">
                                                <div className="text-sm">INSTITUTO</div>
                                                <div className="text-xs opacity-80">SAUDÁVEL</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-4/5 lg:w-3/4">
                                        {heroItem.isHighlight && (
                                            <span className="inline-block bg-[#E87736] text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase mb-4 tracking-wide shadow-sm">
                                                Destaque
                                            </span>
                                        )}
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-orange-100 transition-colors drop-shadow-sm">
                                            {heroItem.title}
                                        </h2>
                                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-300 font-medium">
                                            <span>{heroItem.date}</span>
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                            <span>{heroItem.author}</span>
                                        </div>
                                    </div>
                                </Link>
                            </section>
                        )}

                        {/* 2. Grid Unificado (Index 1+) */}
                        {gridItems.length > 0 && (
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gridItems.map(news => (
                                        <Link to={`/${region}/noticia/${news.id}`} key={news.id} className="block h-full">
                                            {/* Usamos o card padrão para manter consistência visual em todo o grid */}
                                            <NewsCard item={news} /> 
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Sidebar (Global) */}
            <SidebarAds mostReadNews={allContent.slice(0, 4)} />

        </div>
      </main>
    </div>
  );
};

export default News;
