import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { NewsItem, Supplier, Foundry } from '../types';
import NewsCard from '../components/NewsCard';
import SupplierCard from '../components/SupplierCard';
import FoundryCard from '../components/FoundryCard';
import SectionHeader from '../components/SectionHeader';
import SidebarAds from '../components/SidebarAds';
import AdSpot from '../components/AdSpot';
import { Search, Loader2, ChevronRight, FileText, Users, Factory, BookOpen, Calendar } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);

  // Categorized Results State
  const [newsResults, setNewsResults] = useState<NewsItem[]>([]);
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [foundryResults, setFoundryResults] = useState<Foundry[]>([]);
  const [technicalResults, setTechnicalResults] = useState<NewsItem[]>([]);
  const [ebookResults, setEbookResults] = useState<NewsItem[]>([]);
  const [eventResults, setEventResults] = useState<NewsItem[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    setLoading(true);
    const searchTerm = `%${term}%`;

    try {
      // 1. Search News
      const newsPromise = supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(10);

      // 2. Search Suppliers
      const suppliersPromise = supabase
        .from('suppliers')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(10);

      // 3. Search Foundries
      const foundriesPromise = supabase
        .from('foundries')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(10);

      // 4. Search Technical Materials
      const technicalPromise = supabase
        .from('technical_materials')
        .select('*')
        .eq('status', 'published')
        .neq('category', 'E-book')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      // 5. Search Ebooks
      const ebooksPromise = supabase
        .from('ebooks')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      // 6. Search Events
      const eventsPromise = supabase
        .from('events')
        .select('*')
        .neq('status', 'inactive')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(10);

      const [newsRes, suppliersRes, foundriesRes, techRes, ebooksRes, eventsRes] = await Promise.all([
        newsPromise, suppliersPromise, foundriesPromise, technicalPromise, ebooksPromise, eventsPromise
      ]);

      // Map Results
      if (newsRes.data) {
        setNewsResults(newsRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          date: new Date(item.publish_date).toLocaleDateString('pt-BR'),
          author: item.author,
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
          type: 'news'
        })));
      }

      if (suppliersRes.data) {
        setSupplierResults(suppliersRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          logoUrl: item.logo_url || '',
          category: item.category,
          description: item.description,
          phone: item.phone,
          email: item.email,
          location: item.location,
          isVerified: item.is_verified,
          status: item.status
        })));
      }

      if (foundriesRes.data) {
        setFoundryResults(foundriesRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          logoUrl: item.logo_url || '',
          category: item.category,
          description: item.description,
          phone: item.phone,
          email: item.email,
          location: item.location,
          isVerified: item.is_verified,
          status: item.status
        })));
      }

      if (techRes.data) {
        setTechnicalResults(techRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.description,
          category: item.category,
          date: new Date(item.created_at).getFullYear().toString(),
          downloads: item.downloads,
          fileUrl: item.file_url,
          type: 'technical'
        })));
      }

      if (ebooksRes.data) {
        setEbookResults(ebooksRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.description,
          category: item.category,
          date: new Date(item.created_at).getFullYear().toString(),
          downloads: item.downloads,
          imageUrl: item.cover_url || '',
          fileUrl: item.file_url,
          author: item.author,
          type: 'ebook'
        })));
      }

      if (eventsRes.data) {
        setEventResults(eventsRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.description,
          category: 'Evento',
          date: new Date(item.event_date).toLocaleDateString('pt-BR'),
          location: item.location,
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100?text=Evento',
          type: 'event',
          linkUrl: item.link_url
        })));
      }

    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = newsResults.length > 0 || supplierResults.length > 0 || foundryResults.length > 0 || technicalResults.length > 0 || ebookResults.length > 0 || eventResults.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Resultados da Busca</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        
        {/* Banner Topo */}
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot position="top_large" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" />
            </div>
            <div className="block md:hidden">
                <AdSpot position="top_large_mobile" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile" />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-9 space-y-10">
                
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Search className="text-primary" />
                        Resultados para: <span className="text-primary">"{query}"</span>
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary mb-4" size={40} />
                        <p className="text-gray-500">Buscando informações...</p>
                    </div>
                ) : !hasResults ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <Search size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-gray-500">
                            Não encontramos nada relacionado a "{query}". <br/>
                            Tente termos mais genéricos ou verifique a ortografia.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* News Section */}
                        {newsResults.length > 0 && (
                            <section>
                                <SectionHeader title="Notícias e Artigos" icon={<FileText size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {newsResults.map(item => (
                                        <Link to={`/noticia/${item.id}`} key={item.id} className="block h-full">
                                            <NewsCard item={item} variant="compact" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Suppliers Section */}
                        {supplierResults.length > 0 && (
                            <section>
                                <SectionHeader title="Fornecedores" icon={<Users size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {supplierResults.map(supplier => (
                                        <SupplierCard key={supplier.id} supplier={supplier} hideLogo={true} hideContactInfo={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Foundries Section */}
                        {foundryResults.length > 0 && (
                            <section>
                                <SectionHeader title="Fundições" icon={<Factory size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {foundryResults.map(foundry => (
                                        <FoundryCard key={foundry.id} foundry={foundry} hideLogo={true} hideContactInfo={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Technical Materials Section */}
                        {technicalResults.length > 0 && (
                            <section>
                                <SectionHeader title="Materiais Técnicos" icon={<FileText size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {technicalResults.map(item => (
                                        <NewsCard key={item.id} item={item} variant="technical" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Ebooks Section */}
                        {ebookResults.length > 0 && (
                            <section>
                                <SectionHeader title="E-books" icon={<BookOpen size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {ebookResults.map(item => (
                                        <NewsCard key={item.id} item={item} variant="ebook" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Events Section */}
                        {eventResults.length > 0 && (
                            <section>
                                <SectionHeader title="Eventos" icon={<Calendar size={20} />} hasButton={false} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {eventResults.map(item => (
                                        <NewsCard key={item.id} item={item} variant="event" />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Sidebar */}
            <SidebarAds />

        </div>
      </main>
    </div>
  );
};

export default SearchResults;
