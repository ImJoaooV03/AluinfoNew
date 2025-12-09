import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import HeroCarousel from '../components/HeroCarousel';
import SupplierCard from '../components/SupplierCard';
import FoundryCard from '../components/FoundryCard';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { events, suppliers, foundries } from '../data/mockData'; // Mantendo mocks apenas para o que ainda não tem tabela
import { Wrench, Book, Calendar, Users, Factory, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { NewsItem } from '../types';

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [techMaterials, setTechMaterials] = useState<NewsItem[]>([]);
  const [homeEbooks, setHomeEbooks] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // 1. Buscar Notícias
        const newsPromise = supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('publish_date', { ascending: false })
          .limit(6);

        // 2. Buscar Materiais Técnicos (Excluindo E-books)
        const materialsPromise = supabase
          .from('technical_materials')
          .select('*')
          .eq('status', 'published')
          .neq('category', 'E-book')
          .order('created_at', { ascending: false })
          .limit(3);

        // 3. Buscar E-books
        const ebooksPromise = supabase
          .from('technical_materials')
          .select('*')
          .eq('status', 'published')
          .eq('category', 'E-book')
          .order('created_at', { ascending: false })
          .limit(3);

        const [newsRes, materialsRes, ebooksRes] = await Promise.all([
          newsPromise,
          materialsPromise,
          ebooksPromise
        ]);

        if (newsRes.data) {
          setNews(newsRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category,
            date: new Date(item.publish_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            author: item.author,
            imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
            isHighlight: item.is_highlight,
            type: 'news'
          })));
        }

        if (materialsRes.data) {
          setTechMaterials(materialsRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.description, // Mapeando description para summary
            category: item.category,
            date: new Date(item.created_at).getFullYear().toString(),
            downloads: item.downloads,
            fileUrl: item.file_url,
            type: 'technical'
          })));
        }

        if (ebooksRes.data) {
          setHomeEbooks(ebooksRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.description,
            category: item.category,
            date: new Date(item.created_at).getFullYear().toString(),
            downloads: item.downloads,
            imageUrl: item.cover_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Capa',
            fileUrl: item.file_url,
            type: 'ebook'
          })));
        }

      } catch (error) {
        console.error('Erro ao carregar dados da Home:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Slice data for the mixed grid layout based on fetched data
  const highlightNews = news.slice(0, 2);
  const secondaryNews = news.slice(2, 6);

  // Filter verified suppliers/foundries (Mantendo mock por enquanto, mas preparado para DB)
  const verifiedSuppliers = suppliers.filter(s => s.isVerified).slice(0, 3);
  const verifiedFoundries = foundries.filter(f => f.isVerified).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="text-sm text-gray-500">Carregando portal...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Carousel Area */}
      <HeroCarousel />

      <main className="container mx-auto px-4 py-8">
        
        {/* Banner Topo Grande (Global) - Desktop & Mobile Split */}
        <div className="w-full mb-8">
            {/* Desktop Version */}
            <div className="hidden md:block">
                <AdSpot 
                    position="top_large" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
                />
            </div>
            {/* Mobile Version */}
            <div className="block md:hidden">
                <AdSpot 
                    position="top_large_mobile" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-9 space-y-12">
                
                {/* Latest News Section - Mixed Grid */}
                <section>
                    <SectionHeader title="Últimas Notícias" />
                    
                    {news.length > 0 ? (
                      <>
                        {/* Top Row: 2 Large Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {highlightNews.map(item => (
                                <Link to={`/noticia/${item.id}`} key={item.id} className="block h-full">
                                    <NewsCard item={item} variant="highlight" />
                                </Link>
                            ))}
                        </div>

                        {/* Bottom Row: 4 Smaller Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {secondaryNews.map(item => (
                                <Link to={`/noticia/${item.id}`} key={item.id} className="block h-full">
                                    <NewsCard item={item} variant="compact" />
                                </Link>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 bg-white border border-gray-200 rounded-sm">
                        <p className="text-gray-500">Nenhuma notícia publicada no momento.</p>
                      </div>
                    )}
                </section>

                {/* Banner Meio 1 (Acima Fornecedores) */}
                <AdSpot 
                    position="home_middle_1" 
                    className="w-full bg-gray-300"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/555555/ffffff?text=WALBERT+Modelacao+e+Ferramentaria"
                />

                {/* Verified Suppliers Section */}
                <section>
                    <SectionHeader title="Fornecedores em Destaque" icon={<Users size={20} />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verifiedSuppliers.map(supplier => (
                            <SupplierCard key={supplier.id} supplier={supplier} hideLogo={true} hideContactInfo={true} />
                        ))}
                    </div>
                </section>

                {/* Verified Foundries Section */}
                <section>
                    <SectionHeader title="Fundições em Destaque" icon={<Factory size={20} />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verifiedFoundries.map(foundry => (
                            <FoundryCard key={foundry.id} foundry={foundry} hideLogo={true} hideContactInfo={true} />
                        ))}
                    </div>
                </section>

                {/* Technical Materials Section (Dynamic) */}
                <section>
                    <SectionHeader title="Materiais Técnicos" icon={<Wrench size={20} />} />
                    {techMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {techMaterials.map(item => (
                                <NewsCard key={item.id} item={item} variant="technical" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum material técnico disponível.</p>
                        </div>
                    )}
                </section>

                {/* Banner Meio 2 (Acima Ebooks) */}
                <AdSpot 
                    position="home_middle_2" 
                    className="w-full bg-amber-100"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/e5e5e5/333?text=Automatic"
                />

                {/* E-books Section (Dynamic) */}
                <section>
                    <SectionHeader title="E-books" icon={<Book size={20} />} />
                    {homeEbooks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {homeEbooks.map(item => (
                                <NewsCard key={item.id} item={item} variant="ebook" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum e-book disponível.</p>
                        </div>
                    )}
                </section>

                {/* Banner Final (Acima Eventos) */}
                <AdSpot 
                    position="home_final" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/e5e5e5/333?text=Sua+Empresa+Com..."
                />

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

            {/* Sidebar Column (Global) */}
            <SidebarAds mostReadNews={news.slice(0, 4)} />

        </div>
      </main>
    </>
  );
};

export default Home;
