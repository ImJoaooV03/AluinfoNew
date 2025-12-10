import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { Search, ChevronRight, Wrench } from 'lucide-react';
import { NewsItem } from '../types';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { supabase } from '../lib/supabaseClient';
import LeadCaptureModal from '../components/LeadCaptureModal';

const TechnicalArticles = () => {
  const [materials, setMaterials] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Gated Content
  const [selectedMaterial, setSelectedMaterial] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('technical_materials')
        .select('*')
        .eq('status', 'published')
        .neq('category', 'E-book')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedData: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.description,
          category: item.category,
          date: new Date(item.created_at).getFullYear().toString(),
          imageUrl: item.cover_url || '',
          downloads: item.downloads,
          fileUrl: item.file_url,
          type: 'technical'
        }));
        setMaterials(mappedData);
      }
    } catch (err) {
      console.error('Erro ao buscar materiais:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRequest = (item: NewsItem) => {
    setSelectedMaterial(item);
    setIsModalOpen(true);
  };

  const handleLeadSubmit = async (email: string) => {
    // Disparar o download físico
    if (selectedMaterial?.fileUrl) {
        const link = document.createElement('a');
        link.href = selectedMaterial.fileUrl;
        link.target = '_blank';
        link.download = selectedMaterial.title || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const filteredMaterials = materials.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Artigos Técnicos</span>
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
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
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

        {/* Page Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Wrench className="text-primary" size={32} />
                    Materiais Técnicos
                </h1>
                <p className="text-sm text-gray-500 mt-1 pl-11">
                    Catálogos, normas e guias técnicos disponíveis para download.
                </p>
            </div>
            
            {/* Search Filter */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Buscar materiais..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content - Grid Layout */}
            <div className="lg:col-span-9">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <p className="text-gray-500">Nenhum material técnico encontrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.map((item) => (
                            <NewsCard 
                                key={item.id} 
                                item={item} 
                                variant="technical" 
                                onDownloadRequest={handleDownloadRequest}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination (Visual only for now) */}
                {!loading && filteredMaterials.length > 0 && (
                    <div className="flex justify-center items-center gap-2 pt-12 mt-4 border-t border-gray-200">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors uppercase">
                            Carregar Mais
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <SidebarAds />

        </div>
      </main>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLeadSubmit}
        title={selectedMaterial?.title || 'Arquivo'}
        fileName={selectedMaterial?.fileUrl?.split('/').pop()}
        source="technical"
      />
    </div>
  );
};

export default TechnicalArticles;
