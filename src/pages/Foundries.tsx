import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FoundryCard from '../components/FoundryCard';
import { Search, ChevronRight, Factory, Filter } from 'lucide-react';
import { Foundry } from '../types';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { supabase } from '../lib/supabaseClient';
import { useCategories } from '../hooks/useCategories';

const Foundries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foundries, setFoundries] = useState<Foundry[]>([]);
  const [filteredFoundries, setFilteredFoundries] = useState<Foundry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories dynamically
  const { categories } = useCategories('foundry');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFoundries();
  }, []);

  const fetchFoundries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('foundries')
        .select('*')
        .eq('status', 'active')
        .order('is_verified', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedFoundries: Foundry[] = data.map((item: any) => ({
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
        }));
        setFoundries(mappedFoundries);
        setFilteredFoundries(mappedFoundries);
      }
    } catch (err) {
      console.error('Erro ao buscar fundições:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Create a copy to avoid mutating the original data during sort
    let results = [...foundries];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(f => 
        f.name.toLowerCase().includes(lowerTerm) || 
        f.description.toLowerCase().includes(lowerTerm) ||
        f.category.toLowerCase().includes(lowerTerm)
      );
    }

    if (selectedCategory) {
      results = results.filter(f => f.category === selectedCategory);
    }

    // Sort: Verified foundries first
    results.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return 0; // Maintain original order if both are verified or both are not
    });

    setFilteredFoundries(results);
  }, [searchTerm, selectedCategory, foundries]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">Fundições</span>
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
                    fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering"
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

        {/* Page Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Factory className="text-primary" size={32} />
                    Guia de Fundições
                </h1>
                <p className="text-sm text-gray-500 mt-1 pl-11">
                    Encontre as melhores fundições e parceiros de manufatura.
                </p>
            </div>
            
            {/* Search Filter */}
            <div className="relative w-full md:w-72">
                <input 
                    type="text" 
                    placeholder="Buscar fundição, processo ou serviço..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors shadow-sm"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-9">
                
                {/* Category Filters (Dynamic) */}
                <div className="mb-8 flex flex-wrap gap-2">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                            selectedCategory === null 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                selectedCategory === cat.name 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Foundries Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-gray-200 rounded-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredFoundries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFoundries.map((foundry) => (
                            <FoundryCard key={foundry.id} foundry={foundry} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Filter size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhuma fundição encontrada</h3>
                        <p className="text-gray-500 text-sm">Tente ajustar seus termos de busca ou filtros.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}
                            className="mt-4 text-primary font-bold text-sm hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && filteredFoundries.length > 0 && (
                    <div className="flex justify-center items-center gap-2 pt-12 mt-4 border-t border-gray-200">
                        <button className="px-6 py-2.5 bg-white border border-gray-300 rounded-sm text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all uppercase shadow-sm">
                            Carregar Mais Fundições
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <SidebarAds />

        </div>
      </main>
    </div>
  );
};

export default Foundries;
