import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import HeroCarousel from '../components/HeroCarousel';
import SupplierCard from '../components/SupplierCard';
import FoundryCard from '../components/FoundryCard';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { Wrench, Book, Calendar, Users, Factory, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { NewsItem, Supplier, Foundry } from '../types';

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [techMaterials, setTechMaterials] = useState<NewsItem[]>([]);
  const [homeEbooks, setHomeEbooks] = useState<NewsItem[]>([]);
  const [homeSuppliers, setHomeSuppliers] = useState<Supplier[]>([]);
  const [homeFoundries, setHomeFoundries] = useState<Foundry[]>([]);
  const [homeEvents, setHomeEvents] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Captura de Leads
  const [selectedMaterial, setSelectedMaterial] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadSource, setDownloadSource] = useState<'technical' | 'ebook'>('technical');

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

        // 2. Buscar Materiais Técnicos
        const materialsPromise = supabase
          .from('technical_materials')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        // 3. Buscar E-books
        const ebooksPromise = supabase
          .from('ebooks')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        // 4. Buscar Fornecedores Verificados
        const suppliersPromise = supabase
          .from('suppliers')
          .select('*')
          .eq('status', 'active')
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(3);

        // 5. Buscar Fundições Verificadas
        const foundriesPromise = supabase
          .from('foundries')
          .select('*')
          .eq('status', 'active')
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(3);

        // 6. Buscar Eventos (NOVO)
        const eventsPromise = supabase
          .from('events')
          .select('*')
          .neq('status', 'inactive') 
          .order('event_date', { ascending: true }) // Próximos primeiro
          .limit(3);

        const [newsRes, materialsRes, ebooksRes, suppliersRes, foundriesRes, eventsRes] = await Promise.all([
          newsPromise,
          materialsPromise,
          ebooksPromise,
          suppliersPromise,
          foundriesPromise,
          eventsPromise
        ]);

        if (newsRes.data) {
          setNews(newsRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category,
            date: new Date(item.publish_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            author: item.author,
            imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Sem+Imagem',
            isHighlight: item.is_highlight,
            type: 'news'
          })));
        }

        if (materialsRes.data) {
          setTechMaterials(materialsRes.data.map((item: any) => ({
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
          setHomeEbooks(ebooksRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.description,
            category: item.category,
            date: new Date(item.created_at).getFullYear().toString(),
            downloads: item.downloads,
            imageUrl: item.cover_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Capa',
            fileUrl: item.file_url,
            author: item.author,
            type: 'ebook'
          })));
        }

        if (suppliersRes.data) {
            setHomeSuppliers(suppliersRes.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                logoUrl: item.logo_url || '',
                category: item.category,
                description: item.description,
                phone: item.phone,
                email: item.email,
                location: item.location,
                website: item.website,
                isVerified: item.is_verified,
                rating: item.rating,
                status: item.status,
                joinedDate: new Date(item.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            })));
        }

        if (foundriesRes.data) {
            setHomeFoundries(foundriesRes.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                logoUrl: item.logo_url || '',
                category: item.category,
                description: item.description,
                phone: item.phone,
                email: item.email,
                location: item.location,
                website: item.website,
                isVerified: item.is_verified,
                rating: item.rating,
                status: item.status,
                joinedDate: new Date(item.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            })));
        }

        if (eventsRes.data) {
            setHomeEvents(eventsRes.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.description,
                category: 'Evento',
                date: new Date(item.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                location: item.location,
                imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/png?text=Evento',
                type: 'event',
                linkUrl: item.link_url // Mapeando o link externo
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

  // Handler para abrir o modal de download
  const handleDownloadRequest = (item: NewsItem) => {
    setSelectedMaterial(item);
    setDownloadSource(item.type === 'ebook' ? 'ebook' : 'technical');
    setIsModalOpen(true);
  };

  // Handler executado após o sucesso do cadastro do lead
  const handleLeadSubmit = async (email: string) => {
    if (selectedMaterial?.fileUrl) {
        // Criar link temporário para forçar o download
        const link = document.createElement('a');
        link.href = selectedMaterial.fileUrl;
        link.target = '_blank';
        link.download = selectedMaterial.title || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Opcional: Incrementar contador de downloads no banco
        try {
            const table = selectedMaterial.type === 'ebook' ? 'ebooks' : 'technical_materials';
            await supabase.rpc('increment_downloads', { table_name: table, row_id: selectedMaterial.id });
        } catch (e) {
            // Ignora erro se a função RPC não existir
        }
    }
  };

  const highlightNews = news.slice(0, 2);
  const secondaryNews = news.slice(2, 6);

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
      <HeroCarousel />

      <main className="container mx-auto px-4 py-8">
        
        {/* Banner Topo */}
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot position="top_large" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" />
            </div>
            <div className="block md:hidden">
                <AdSpot position="top_large_mobile" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333333/ffffff?text=MAGMA+Mobile" />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9 space-y-12">
                
                {/* Notícias */}
                <section>
                    <SectionHeader title="Últimas Notícias" />
                    {news.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {highlightNews.map(item => (
                                <Link to={`/noticia/${item.id}`} key={item.id} className="block h-full">
                                    <NewsCard item={item} variant="highlight" />
                                </Link>
                            ))}
                        </div>
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
                        <p className="text-gray-500">Nenhuma notícia publicada.</p>
                      </div>
                    )}
                </section>

                <AdSpot position="home_middle_1" className="w-full bg-gray-300" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/555555/ffffff?text=WALBERT" />

                {/* Fornecedores em Destaque (Reais) */}
                <section>
                    <SectionHeader title="Fornecedores em Destaque" icon={<Users size={20} />} />
                    {homeSuppliers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {homeSuppliers.map(supplier => (
                                <SupplierCard key={supplier.id} supplier={supplier} hideLogo={true} hideContactInfo={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum fornecedor verificado encontrado.</p>
                        </div>
                    )}
                </section>

                {/* Fundições em Destaque (Reais) */}
                <section>
                    <SectionHeader title="Fundições em Destaque" icon={<Factory size={20} />} />
                    {homeFoundries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {homeFoundries.map(foundry => (
                                <FoundryCard key={foundry.id} foundry={foundry} hideLogo={true} hideContactInfo={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhuma fundição verificada encontrada.</p>
                        </div>
                    )}
                </section>

                {/* Materiais Técnicos com Popup */}
                <section>
                    <SectionHeader title="Materiais Técnicos" icon={<Wrench size={20} />} />
                    {techMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {techMaterials.map(item => (
                                <NewsCard 
                                    key={item.id} 
                                    item={item} 
                                    variant="technical" 
                                    onDownloadRequest={handleDownloadRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum material técnico disponível.</p>
                        </div>
                    )}
                </section>

                <AdSpot position="home_middle_2" className="w-full bg-amber-100" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/e5e5e5/333?text=Automatic" />

                {/* E-books com Popup */}
                <section>
                    <SectionHeader title="E-books" icon={<Book size={20} />} />
                    {homeEbooks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {homeEbooks.map(item => (
                                <NewsCard 
                                    key={item.id} 
                                    item={item} 
                                    variant="ebook" 
                                    onDownloadRequest={handleDownloadRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum e-book disponível.</p>
                        </div>
                    )}
                </section>

                <AdSpot position="home_final" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1000x150/e5e5e5/333?text=Sua+Empresa+Com..." />

                {/* Eventos (Reais) */}
                <section>
                    <SectionHeader title="Eventos" icon={<Calendar size={20} />} />
                    {homeEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {homeEvents.map(item => (
                                <NewsCard key={item.id} item={item} variant="event" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-gray-200 rounded-sm">
                            <p className="text-gray-500 text-sm">Nenhum evento próximo.</p>
                        </div>
                    )}
                </section>

            </div>

            <SidebarAds mostReadNews={news.slice(0, 4)} />
        </div>
      </main>

      {/* Modal de Captura de Leads Global */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLeadSubmit}
        title={selectedMaterial?.title || 'Material'}
        fileName={selectedMaterial?.fileUrl?.split('/').pop()}
        source={downloadSource}
      />
    </>
  );
};

export default Home;
