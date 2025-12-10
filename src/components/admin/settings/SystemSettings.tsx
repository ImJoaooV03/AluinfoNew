import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../contexts/ToastContext';
import { Monitor, Moon, Globe, Loader2, Save } from 'lucide-react';
import { SystemSettings as SystemSettingsType } from '../../../types/settings';
import clsx from 'clsx';

const SystemSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [system, setSystem] = useState<SystemSettingsType>({
    theme: 'light',
    language: 'pt'
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.preferences?.system) {
        setSystem(data.preferences.system);
      }
    } catch (err) {
      console.error('Erro ao carregar preferências de sistema:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Busca preferências atuais para manter 'notifications' intacto
      const { data: currentData } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const currentPreferences = currentData?.preferences || {};

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            ...currentPreferences,
            system: system
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      addToast('success', 'Configurações do sistema atualizadas.');
      
      // Opcional: Aplicar tema imediatamente (exemplo simples)
      if (system.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      addToast('error', 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <Monitor className="text-primary" size={24} />
        Preferências do Sistema
      </h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Moon size={16} className="text-gray-500" /> Aparência
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
                { id: 'light', label: 'Claro', bg: 'bg-gray-100', border: 'border-gray-200' },
                { id: 'dark', label: 'Escuro', bg: 'bg-gray-800', border: 'border-gray-700' },
                { id: 'system', label: 'Automático', bg: 'bg-gradient-to-r from-gray-100 to-gray-800', border: 'border-gray-300' }
            ].map((theme) => (
                <button 
                    key={theme.id}
                    onClick={() => setSystem({...system, theme: theme.id as any})}
                    className={clsx(
                        "p-4 rounded-xl border-2 text-center transition-all group",
                        system.theme === theme.id 
                            ? "border-primary bg-orange-50 ring-2 ring-primary/20" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                >
                    <div className={clsx("w-full h-20 rounded-lg mb-3 border shadow-sm transition-transform group-hover:scale-105", theme.bg, theme.border)}></div>
                    <span className={clsx(
                        "text-sm font-bold",
                        system.theme === theme.id ? "text-primary" : "text-gray-600"
                    )}>{theme.label}</span>
                </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={16} className="text-gray-500" /> Idioma
          </h3>
          <div className="max-w-xs">
            <select 
                value={system.language}
                onChange={(e) => setSystem({...system, language: e.target.value as any})}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
                <option value="pt">Português (Brasil)</option>
                <option value="en">English (US)</option>
                <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSaveSystem}
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Aplicar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
