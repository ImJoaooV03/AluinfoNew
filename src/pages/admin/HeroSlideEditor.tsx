import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';

const HeroSlideEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { region } = useRegion();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    display_order: 1,
    status: 'active',
    region: region // Default
  });

  useEffect(() => {
    if (isEditing) fetchSlide();
    else {
        setFormData(prev => ({ ...prev, region }));
        setFetching(false);
    }
  }, [id, region]);

  const fetchSlide = async () => {
    try {
      const { data } = await supabase.from('hero_slides').select('*').eq('id', id).single();
      if (data) setFormData({ ...data });
    } catch (err) { console.error(err); } finally { setFetching(false); }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, region, updated_at: new Date().toISOString() };
      if (isEditing) await supabase.from('hero_slides').update(payload).eq('id', id);
      else await supabase.from('hero_slides').insert([{ ...payload, created_at: new Date().toISOString() }]);
      navigate(`/${region}/admin/hero`);
    } catch (err) { alert('Erro ao salvar'); } finally { setLoading(false); }
  };

  if (fetching) return <AdminLayout><div className="flex justify-center h-64"><Loader2 className="animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate(`/${region}/admin/hero`)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Slide' : 'Novo Slide'}</h1>
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-md font-bold flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
            </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Título (Controle Interno)</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Link de Destino</label>
                <input type="url" name="link_url" value={formData.link_url} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="https://..." />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ordem</label>
                <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            </div>
            {/* Image display logic simplified for brevity - assumes URL is set via bulk upload or manually here if needed */}
            {formData.image_url && (
                <div className="mt-4">
                    <p className="text-xs font-bold mb-2">Imagem Atual:</p>
                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded border" />
                </div>
            )}
        </div>
      </form>
    </AdminLayout>
  );
};

export default HeroSlideEditor;
