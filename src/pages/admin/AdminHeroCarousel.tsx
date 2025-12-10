import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Loader2, AlertCircle, UploadCloud, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import HeroCarousel, { HeroSlide } from '../../components/HeroCarousel';
import clsx from 'clsx';
import { useRegion } from '../../contexts/RegionContext';

const AdminHeroCarousel = () => {
  const navigate = useNavigate();
  const { region } = useRegion();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlides();
  }, [region]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('region', region) // Filtro por Região
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data) setSlides(data as HeroSlide[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const newSlides: HeroSlide[] = [];
      const currentMaxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order || 0)) : 0;

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${region}_hero_${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('hero-slides').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('hero-slides').getPublicUrl(fileName);

        const newSlide = {
          title: 'NOVO DESTAQUE',
          image_url: publicUrl,
          status: 'active',
          region: region, // Salvar com Região
          display_order: currentMaxOrder + i + 1,
          created_at: new Date().toISOString()
        };

        const { data: insertedData, error: insertError } = await supabase.from('hero_slides').insert([newSlide]).select().single();
        if (insertError) throw insertError;
        newSlides.push(insertedData);
      }
      setSlides(prev => [...prev, ...newSlides]);
    } catch (err) {
      alert('Erro no upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir slide?')) return;
    try {
      await supabase.from('hero_slides').delete().eq('id', id);
      setSlides(slides.filter(s => s.id !== id));
    } catch (err) { alert('Erro ao excluir.'); }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Carrossel Home ({region.toUpperCase()})</h1>
        <p className="text-gray-500">Gerencie os banners para a região {region}.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Visualização</h2>
            <div className="rounded-sm overflow-hidden border border-gray-300 bg-gray-100">
                {loading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div> : 
                 slides.length === 0 ? <div className="h-64 flex items-center justify-center text-gray-400">Nenhum slide ativo</div> :
                 <HeroCarousel slides={slides} autoPlay={true} />
                }
            </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Adicionar Imagens</h2>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={32} className="text-gray-400" />}
                <span className="text-sm font-bold text-gray-500 mt-2">Clique para enviar (Múltiplos)</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
        </section>

        {slides.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-xs font-bold">{index + 1}</div>
                            <img src={slide.image_url} alt="" className="w-24 h-14 object-cover rounded bg-gray-100" />
                            <div className="flex-grow"><h3 className="text-sm font-bold">{slide.title}</h3></div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/${region}/admin/hero/edit/${slide.id}`)} className="p-2 text-blue-600"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(slide.id)} className="p-2 text-red-600"><Trash2 size={16} /></button>
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
