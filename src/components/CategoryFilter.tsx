import React from 'react';
import clsx from 'clsx';
import { Category } from '../hooks/useCategories';
import { Grid, Layers, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedMainCategory: string | null;
  selectedSubCategory: string | null;
  onSelectMain: (name: string | null) => void;
  onSelectSub: (name: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedMainCategory,
  selectedSubCategory,
  onSelectMain,
  onSelectSub
}) => {
  
  const activeMain = categories.find(c => c.name === selectedMainCategory);
  const subcategories = activeMain?.subcategories || [];

  const allItems = [
    { id: 'all', name: 'Todos' },
    ...categories
  ];

  return (
    <div className="mb-8 w-full">
      {/* Container Principal com Scroll Horizontal e Padding para Sombras */}
      <div className="w-full overflow-x-auto scrollbar-hide py-4 px-2">
        <div className="flex items-center min-w-max pl-2">
            {allItems.map((cat, index) => {
                const isSelected = cat.id === 'all' 
                    ? selectedMainCategory === null 
                    : selectedMainCategory === cat.name;
                
                const isFirst = index === 0;
                const isLast = index === allItems.length - 1;

                // Lógica de Z-Index: O item selecionado sempre fica por cima (z-50).
                // Os itens à direita do selecionado ficam "atrás" dos itens à esquerda para o efeito de cascata correto,
                // ou vice-versa, dependendo do design. Aqui, priorizamos o selecionado.
                const zIndex = isSelected ? 50 : 40 - index;

                return (
                    <button
                        key={cat.id}
                        onClick={() => {
                            if (cat.id === 'all') {
                                onSelectMain(null);
                                onSelectSub(null);
                            } else {
                                if (selectedMainCategory === cat.name) {
                                    onSelectMain(null);
                                    onSelectSub(null);
                                } else {
                                    onSelectMain(cat.name);
                                    onSelectSub(null);
                                }
                            }
                        }}
                        className={clsx(
                            "relative h-14 min-w-[150px] flex items-center justify-center transition-all duration-300 outline-none focus:outline-none -ml-6 first:ml-0",
                            isSelected ? "scale-105 mx-2" : "hover:scale-105 hover:z-40"
                        )}
                        style={{ zIndex }}
                    >
                        {/* Background Shape (Skewed) */}
                        <div 
                            className={clsx(
                                "absolute inset-0 transform -skew-x-[20deg] shadow-md transition-all duration-300 border",
                                isSelected 
                                    ? "bg-gradient-to-r from-[#F37021] to-[#E85D04] border-[#d65a12] shadow-orange-500/30" 
                                    : "bg-gradient-to-b from-white to-gray-100 border-gray-300 hover:bg-white",
                                isFirst ? "rounded-l-2xl" : "rounded-tl-lg rounded-bl-lg",
                                isLast ? "rounded-r-2xl" : "rounded-tr-lg rounded-br-lg"
                            )}
                        >
                            {/* Brilho interno para dar volume no ativo */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 rounded-l-2xl pointer-events-none" />
                            )}
                        </div>

                        {/* Conteúdo (Não inclinado) */}
                        <div className={clsx(
                            "relative z-10 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider px-6 w-full",
                            isSelected ? "text-white drop-shadow-sm" : "text-gray-600"
                        )}>
                            {cat.id === 'all' && <Grid size={18} className={isSelected ? "text-white" : "text-gray-400"} />}
                            <span>{cat.name}</span>
                            
                            {/* Dot indicador (apenas em inativos que têm subcategorias) */}
                            {!isSelected && cat.id !== 'all' && (cat as Category).subcategories && (cat as Category).subcategories!.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-[#F37021] ml-1 shadow-sm" title="Possui subcategorias" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
      </div>

      {/* Painel de Subcategorias (Expansível) */}
      {selectedMainCategory && subcategories.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 ease-out px-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-wrap gap-3 items-center">
                
                {/* Indicador Visual */}
                <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mr-2 border-r border-gray-200 pr-4 h-6">
                    <Layers size={14} />
                    Filtrar
                    <ChevronRight size={12} />
                </div>

                {/* Botão "Todas" dentro da subcategoria */}
                <button
                    onClick={() => onSelectSub(null)}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all border uppercase tracking-wide",
                        selectedSubCategory === null
                            ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-white"
                    )}
                >
                    Todas
                </button>

                {subcategories.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => onSelectSub(selectedSubCategory === sub.name ? null : sub.name)}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border uppercase tracking-wide transform hover:-translate-y-0.5",
                            selectedSubCategory === sub.name
                                ? "bg-[#F37021] text-white border-[#F37021] shadow-md shadow-orange-200"
                                : "bg-white text-gray-600 border-gray-200 hover:border-[#F37021]/50 hover:text-[#F37021] hover:shadow-sm"
                        )}
                    >
                        {sub.name}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
