import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../contexts/ToastContext';
import { useRegion } from '../../../contexts/RegionContext';
import { UploadCloud, Save, Loader2, Image as ImageIcon, Trash2, Globe } from 'lucide-react';
import clsx from 'clsx';

const SiteIdentitySettings = () => {
  const { region, refreshLogo } = useRegion(); // Hook para forçar atualização global
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    logo_url: '',
    site_name: 'AluInfo'
  });

  useEffect(() => {
    fetchSettings();
  }, [region]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('region', region)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          logo_url: data.logo_url || '',
          site_name: data.site_name || 'AluInfo'
        });
      } else {
        // Defaults
        setSettings({ logo_url: '', site_name: 'AluInfo' });
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validação
    if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'A logo deve ter no máximo 2MB.');
        return;
    }

    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        // Nome único com timestamp para evitar cache
        const fileName = `${region}_logo_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('site-assets')
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('site-assets')
            .getPublicUrl(fileName);

        setSettings(prev => ({ ...prev, logo_url: publicUrl }));
        addToast('success', 'Logo enviada! Clique em Salvar para aplicar.');

    } catch (err: any) {
        console.error(err);
        addToast('error', 'Erro no upload da logo.');
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        const payload = {
            region: region,
            logo_url: settings.logo_url,
            site_name: settings.site_name,
            updated_at: new Date().toISOString()
        };

        // Upsert baseado na região (chave única)
        const { error } = await supabase
            .from('site_settings')
            .upsert(payload, { onConflict: 'region' });

        if (error) throw error;

        addToast('success', 'Identidade visual atualizada!');
        
        // Atualiza o contexto global para refletir a mudança imediatamente
        if (refreshLogo) refreshLogo();

    } catch (err: any) {
        console.error(err);
        addToast('error', 'Erro ao salvar: ' + err.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <Globe className="text-primary" size={24} />
        Identidade Visual ({region.toUpperCase()})
      </h2>

      <div className="space-y-8 max-w-2xl">
        
        {/* Logo Upload Section */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Logotipo do Site</label>
            <p className="text-xs text-gray-500 mb-4">Esta imagem substituirá a logo padrão no cabeçalho, rodapé e painel admin desta região.</p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Preview Box - Dark Background to simulate header */}
                <div className="w-full sm:w-48 h-32 bg-[#222] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center overflow-hidden relative group shadow-inner">
                    {settings.logo_url ? (
                        <>
                            <img src={settings.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setSettings(prev => ({ ...prev, logo_url: '' }))}
                                    className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600"
                                    title="Remover Logo"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="mx-auto mb-1" />
                            <span className="text-xs">Sem Logo</span>
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-grow">
                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                            onChange={handleLogoUpload} 
                            className="hidden" 
                            id="logo-upload-input"
                            disabled={uploading}
                        />
                        <label 
                            htmlFor="logo-upload-input" 
                            className={clsx(
                                "flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors",
                                uploading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                            {uploading ? 'Enviando...' : 'Carregar Nova Imagem'}
                        </label>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                        Formatos: PNG, JPG, SVG, WEBP. Fundo transparente recomendado.
                        <br/>A visualização ao lado simula o fundo escuro do cabeçalho.
                    </p>
                </div>
            </div>
        </div>

        {/* Site Name (Optional) */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Site (Alt Text)</label>
            <input 
                type="text" 
                value={settings.site_name}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Ex: AluInfo Brasil"
            />
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Configurações
            </button>
        </div>

      </div>
    </div>
  );
};

export default SiteIdentitySettings;
