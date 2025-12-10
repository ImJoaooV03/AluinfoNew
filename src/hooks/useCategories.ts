import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Category {
  id: string;
  name: string;
  type: string;
}

export const useCategories = (type: 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('type', type)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  return { categories, loading };
};
