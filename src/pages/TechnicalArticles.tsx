import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { technicalMaterials, sidebarAds } from '../data/mockData';
import SectionHeader from '../components/SectionHeader';
import NewsCard from '../components/NewsCard';
import { Search, ChevronRight, Wrench } from 'lucide-react';
import { NewsItem } from '../types';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';

const TechnicalArticles = () => {
  // Expand the list to simulate a full page of content by duplicating the mock data
  const fullMaterialList: NewsItem[] = [
    ...technicalMaterials,
    ...technicalMaterials.map(item => ({ ...item, id: item.id + '_dup1' })),
    ...technicalMaterials.map(item => ({ ...item, id: item.id + '_dup2' })).slice(0, 3)
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        
        {/* Banner Topo Grande (Global) - Desktop & Mobile Split */}
        <div className="w-full mb-8">
            {/* Desktop Version */}
            <div className="hidden md:block">
                <AdSpot 
                    position="top_large" 
                    className="w-full bg-gray-200"
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
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
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content - Grid Layout */}
            <div className="lg:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fullMaterialList.map((item) => (
                        <NewsCard key={item.id} item={item} variant="technical" />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 pt-12 mt-4 border-t border-gray-200">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors uppercase">
                        Carregar Mais
                    </button>
                </div>
            </div>

            {/* Sidebar - Consistent with other pages */}
            <SidebarAds />

        </div>
      </main>
    </div>
  );
};

export default TechnicalArticles;
