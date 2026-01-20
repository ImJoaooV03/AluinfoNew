import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SupplierCard from '../components/SupplierCard';
import { Search, ChevronRight, Users, Filter, Loader2 } from 'lucide-react';
import { Supplier } from '../types';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { supabase } from '../lib/supabaseClient';
import { useCategories } from '../hooks/useCategories';
import { useRegion } from '../contexts/RegionContext';
import CategoryFilter from '../components/CategoryFilter';

const Suppliers = () => {
  const { region, t } = useRegion();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Novos estados para o filtro hierárquico
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Busca categorias hierárquicas
  const { hierarchicalCategories } = useCategories('supplier');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSuppliers();
  }, [region]);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('status', 'active')
        .eq('region', region)
        .order('is_verified', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedSuppliers: Supplier[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          logoUrl: item.logo_url || '',
          category: item.category, // Aqui assumimos que o banco guarda a subcategoria (nome específico)
          description: item.description,
          phone: item.phone,
          email: item.email,
          location: item.location,
          website: item.website,
          isVerified: item.is_verified,
          rating: item.rating,
          status: item.status,
          joinedDate: new Date(item.created_at).toLocaleDateString(region === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', year: 'numeric' })
        }));
        setSuppliers(mappedSuppliers);
        setFilteredSuppliers(mappedSuppliers);
      }
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let results = [...suppliers];

    // 1. Filtro de Texto
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(lowerTerm) || 
        s.description.toLowerCase().includes(lowerTerm) ||
        s.category.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filtro de Categoria Hierárquica
    if (selectedMainCategory) {
        if (selectedSubCategory) {
            // Se uma subcategoria específica foi selecionada, filtra por ela exata
            results = results.filter(s => s.category === selectedSubCategory);
        } else {
            // Se apenas a categoria principal foi selecionada, precisamos encontrar todas as subcategorias dela
            const mainCatObj = hierarchicalCategories.find(c => c.name === selectedMainCategory);
            if (mainCatObj) {
                // Lista de nomes aceitos: O nome da própria categoria pai (caso seja usada diretamente) + nomes das filhas
                const validCategories = [
                    mainCatObj.name, 
                    ...(mainCatObj.subcategories?.map(sub => sub.name) || [])
                ];
                results = results.filter(s => validCategories.includes(s.category));
            }
        }
    }

    // Ordenação (Verificados primeiro)
    results.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return 0;
    });

    setFilteredSuppliers(results);
  }, [searchTerm, selectedMainCategory, selectedSubCategory, suppliers, hierarchicalCategories]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to={`/${region}`} className="hover:text-primary transition-colors">{t('home')}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">{t('suppliers')}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot position="top_large" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333/fff?text=MAGMA" />
            </div>
            <div className="block md:hidden">
                <AdSpot position="top_large_mobile" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333/fff?text=MAGMA" />
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="text-primary" size={32} />
                    {t('suppliers')}
                </h1>
            </div>
            <div className="relative w-full md:w-72">
                <input 
                    type="text" 
                    placeholder={t('search') + "..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors shadow-sm"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
                
                {/* Novo Filtro Hierárquico */}
                <CategoryFilter 
                    categories={hierarchicalCategories}
                    selectedMainCategory={selectedMainCategory}
                    selectedSubCategory={selectedSubCategory}
                    onSelectMain={setSelectedMainCategory}
                    onSelectSub={setSelectedSubCategory}
                />

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-gray-200 rounded-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredSuppliers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <SupplierCard key={supplier.id} supplier={supplier} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Filter size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum fornecedor encontrado</h3>
                        <p className="text-gray-500 text-sm">Tente ajustar os filtros ou a busca.</p>
                    </div>
                )}
            </div>
            <SidebarAds />
        </div>
      </main>
    </div>
  );
};

export default Suppliers;
