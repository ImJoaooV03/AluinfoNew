import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

export interface Category {
  id: string;
  name: string;
  type: string;
  region?: string;
  parent_id?: string | null;
  subcategories?: Category[]; // Helper para o frontend
}

export const useCategories = (type: 'news' | 'technical' | 'ebook' | 'event' | 'supplier' | 'foundry') => {
  const { region } = useRegion();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0); // Gatilho para recarregar

  // Função para forçar atualização dos dados sem recarregar a página
  const refetch = useCallback(() => {
    setTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('type', type)
          .eq('region', region)
          .order('name', { ascending: true });

        if (error) throw error;

        const allCats = data as Category[];
        setCategories(allCats);

        // Montar hierarquia (Pais com seus Filhos)
        const parents = allCats.filter(c => !c.parent_id);
        const children = allCats.filter(c => c.parent_id);

        const structured = parents.map(parent => ({
            ...parent,
            subcategories: children.filter(child => child.parent_id === parent.id)
        }));

        setHierarchicalCategories(structured);

      } catch (error) {
        console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type, region, trigger]); // Adicionado 'trigger' às dependências

  return { categories, hierarchicalCategories, loading, refetch };
};
