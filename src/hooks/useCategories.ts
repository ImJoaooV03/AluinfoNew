import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

export interface Category {
  id: string;
  name: string;
  type: string;
  region?: string;
}

export const useCategories = (type: 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry') => {
  const { region } = useRegion();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('type', type)
          .eq('region', region) // Filtro Estrito por Região
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error(`Erro ao buscar categorias do tipo ${type} na região ${region}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type, region]); // Recarregar quando a região mudar

  return { categories, loading };
};
