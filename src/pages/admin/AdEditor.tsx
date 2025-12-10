import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, ArrowLeft, Loader2, UploadCloud, Megaphone, Link as LinkIcon, Layout, Eye, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';
import clsx from 'clsx';

const AdEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { region } = useRegion();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'sidebar_1',
    status: 'active',
    region: region
  });

  // Garante a região correta ao criar novo
  useEffect(() => {
    if (!isEditing) {
        setFormData(prev => ({ ...prev, region }));
    }
  }, [region, isEditing]);

  useEffect(() => {
    if (isEditing) {
        fetchAd();
    } else {
        setFetching(false);
    }
  }, [id]);

  const fetchAd = async () => {
    try {
      const { data, error } = await supabase.from('ads').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData({ ...data });
    } catch (err) { 
        console.error(err);
        addToast('error', 'Erro ao carregar anúncio.');
    } finally { 
        setFetching(false); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${region}_ad_${Date.now()}.${fileExt}`;
    
    setUploading(true);
    try {
        const { error } = await supabase.storage.from('ad-banners').upload(fileName, file);
        if (error) throw error;
        
        const { data } = supabase.storage.from('ad-banners').getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
        addToast('success', 'Banner enviado com sucesso!');
    } catch (e) { 
        console.error(e);
        addToast('error', 'Erro no upload do banner.'); 
    } finally { 
        setUploading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        addToast('error', 'O nome da campanha é obrigatório.');
        return;
    }
    
    setLoading(true);
    try {
      const payload = { 
          ...formData, 
          region: isEditing ? formData.region : region, 
          updated_at: new Date().toISOString() 
      };
      
      if (isEditing) {
        const { error } = await supabase.from('ads').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ads').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      addToast('success', 'Anúncio salvo com sucesso!');
      navigate(`/${region}/admin/ads`);
    } catch (err: any) { 
        console.error(err);
        addToast('error', 'Erro ao salvar: ' + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  if (fetching) return <AdminLayout><div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate(`/${region}/admin/ads`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Anúncio' : 'Novo Anúncio'} ({region.toUpperCase()})</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold text-primary">Gestão de Publicidade</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`/${region}/admin/ads`)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-sm">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Info */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                        <Megaphone size={16} /> Informações da Campanha
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome da Campanha / Cliente <span className="text-red-500">*</span></label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800" required placeholder="Ex: Campanha de Verão - Cliente X" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1"><LinkIcon size={14} /> Link de Destino</label>
                        <input type="url" name="link_url" value={formData.link_url} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://..." />
                        <p className="text-[10px] text-gray-400 mt-1">Para onde o usuário será redirecionado ao clicar.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex gap-2">
                        <Layout size={16} /> Configurações de Exibição
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Posição no Site</label>
                        <select name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                            <optgroup label="Cabeçalho">
                                <option value="top_large">Topo Grande (Desktop - 1200x150)</option>
                                <option value="top_large_mobile">Topo Grande (Mobile - 400x150)</option>
                            </optgroup>
                            <optgroup label="Barra Lateral (Sidebar)">
                                <option value="sidebar_1">Lateral 1 (Topo - 360x150)</option>
                                <option value="sidebar_2">Lateral 2 (Meio - 360x150)</option>
                                <option value="sidebar_3">Lateral 3 (Baixo - 360x150)</option>
                                <option value="sidebar_4">Lateral 4 (Fim - 360x150)</option>
                            </optgroup>
                            <optgroup label="Corpo da Home">
                                <option value="home_middle_1">Home Meio 1 (1000x150)</option>
                                <option value="home_middle_2">Home Meio 2 (1000x150)</option>
                                <option value="home_final">Home Final (1000x150)</option>
                            </optgroup>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Right Column: Image */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Banner Publicitário
                    </h3>
                    
                    <div className="relative">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="ad-upload" disabled={uploading} />
                        <label htmlFor="ad-upload" className={clsx("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group", uploading && "opacity-50 cursor-not-allowed")}>
                            {uploading ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : (
                                <>
                                    <UploadCloud className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="text-sm font-medium text-gray-600">Enviar Banner</span>
                                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF</span>
                                </>
                            )}
                        </label>
                    </div>

                    {formData.image_url && (
                        <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 relative group">
                            <img src={formData.image_url} alt="Preview" className="w-full h-auto object-contain" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center backdrop-blur-sm">
                                Visualização
                            </div>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Eye size={16} /> Métricas (Simuladas)</h4>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white p-2 rounded border border-blue-100">
                                <span className="block text-lg font-bold text-blue-600">1,240</span>
                                <span className="text-[10px] text-gray-500 uppercase">Visualizações</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-blue-100">
                                <span className="block text-lg font-bold text-green-600">48</span>
                                <span className="text-[10px] text-gray-500 uppercase">Cliques</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdEditor;
