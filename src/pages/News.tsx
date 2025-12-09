import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sidebarAds } from '../data/mockData';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import NewsletterWidget from '../components/NewsletterWidget';
import { Search, TrendingUp, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { NewsItem } from '../types';

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedNews: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          date: new Date(item.publish_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          author: item.author,
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
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
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Notícias</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        
        {/* Top Ad Banner */}
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
                        )}

                        {/* News Grid */}
                        {newsList.length > 0 && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {newsList.map(news => (
                                    <Link to={`/noticia/${news.id}`} key={news.id} className="block h-full">
                                        <NewsCard item={news} variant="highlight" />
                                    </Link>
                                ))}
                            </section>
                        )}

                        {/* Pagination (Visual only for now) */}
                        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-200">
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold text-sm">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}

            </div>

            {/* Sidebar */}
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
                        {news.slice(0, 4).map((item, i) => (
                            <li key={item.id} className="flex gap-3 items-start group cursor-pointer">
                                <span className="text-2xl font-bold text-gray-200 leading-none group-hover:text-primary transition-colors">{i + 1}</span>
                                <Link to={`/noticia/${item.id}`} className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-900">
                                    {item.title}
                                </Link>
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
