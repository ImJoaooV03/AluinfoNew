import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Loader2, AlertCircle, UploadCloud, Trash2, Edit, Image as ImageIcon, CheckCircle } from 'lucide-react';
import HeroCarousel, { HeroSlide } from '../../components/HeroCarousel';
import clsx from 'clsx';

const AdminHeroCarousel = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default Placeholder Slide (Static)
  const defaultSlide: HeroSlide = {
    id: 'default',
    title: 'BEM-VINDO AO ALUINFO',
    image_url: 'https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=1920&auto=format&fit=crop',
    subtitle: 'O maior portal de notícias do setor',
    link_url: '#'
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setSlides(data as HeroSlide[]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar slides:', err);
      setError(err.message || 'Falha ao carregar slides.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newSlides: HeroSlide[] = [];
      const currentMaxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order || 0)) : 0;

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `hero_${Date.now()}_${i}.${fileExt}`;

        // 1. Upload Image
        const { error: uploadError } = await supabase.storage
          .from('hero-slides')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hero-slides')
          .getPublicUrl(fileName);

        // 2. Create DB Record
        const newSlide = {
          title: 'NOVO DESTAQUE',
          image_url: publicUrl,
          status: 'active',
          display_order: currentMaxOrder + i + 1,
          created_at: new Date().toISOString()
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('hero_slides')
          .insert([newSlide])
          .select()
          .single();

        if (insertError) throw insertError;
        newSlides.push(insertedData);
      }

      setSlides(prev => [...prev, ...newSlides]);

    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Erro ao enviar imagens. Tente novamente.');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este slide?')) return;

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSlides(slides.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrossel da Home</h1>
          <p className="text-gray-500">Gerencie os banners principais do site.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        
        {/* 1. Preview Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                Visualização em Tempo Real
            </h2>
            
            <div className="rounded-sm overflow-hidden border border-gray-300 shadow-inner bg-gray-100">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : slides.length === 0 ? (
                    // Static Default Image Logic
                    <div className="relative w-full h-64 group">
                        <img 
                            src={defaultSlide.image_url} 
                            alt="Default" 
                            className="w-full h-full object-cover grayscale opacity-50" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 px-6 py-3 rounded-md shadow-lg text-center">
                                <p className="text-gray-800 font-bold">Nenhum slide ativo</p>
                                <p className="text-xs text-gray-500">Esta imagem padrão será exibida (ou nada).</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Interactive Carousel Logic
                    <HeroCarousel slides={slides} autoPlay={true} />
                )}
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>
                    {slides.length === 0 
                        ? "Modo Estático (Padrão)" 
                        : slides.length === 1 
                            ? "Modo Estático (Imagem Única)" 
                            : `Modo Carrossel (${slides.length} slides)`}
                </span>
                {slides.length > 1 && (
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                        <CheckCircle size={12} /> Rotação Automática Ativa
                    </span>
                )}
            </div>
        </section>

        {/* 2. Upload Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <UploadCloud size={20} className="text-primary" />
                Adicionar Imagens
            </h2>

            <div className="relative">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="bulk-upload"
                    disabled={uploading}
                />
                <label 
                    htmlFor="bulk-upload"
                    className={clsx(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all group",
                        uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary"
                    )}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center text-gray-500">
                            <Loader2 className="animate-spin mb-2" size={28} />
                            <span className="text-sm font-medium">Enviando imagens...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-primary transition-colors">
                            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-orange-50 transition-colors">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-bold">Clique para adicionar imagens</span>
                            <span className="text-xs text-gray-400 mt-1">Suporta envio múltiplo (Drag & Drop)</span>
                        </div>
                    )}
                </label>
            </div>
        </section>

        {/* 3. Management List */}
        {slides.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Gerenciar Slides ({slides.length})
                    </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                            {/* Order */}
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-xs font-bold text-gray-600 flex-shrink-0">
                                {index + 1}
                            </div>

                            {/* Thumbnail */}
                            <div className="w-24 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">{slide.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{slide.subtitle || 'Sem subtítulo'}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => navigate(`/admin/hero/edit/${slide.id}`)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar Detalhes"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(slide.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Remover Slide"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminHeroCarousel;
