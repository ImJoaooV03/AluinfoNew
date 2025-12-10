import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../contexts/ToastContext';
import { Bell, Loader2, Save } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from '../../../types/settings';

const NotificationSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettingsType>({
    email_news: true,
    email_security: true,
    push_comments: false,
    push_orders: true
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

      if (data?.preferences?.notifications) {
        setNotifications(data.preferences.notifications);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Primeiro buscamos as preferências atuais para não sobrescrever a parte de 'system'
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
            notifications: notifications
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      addToast('success', 'Preferências de notificação salvas.');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      addToast('error', 'Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );

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
        <Bell className="text-primary" size={24} />
        Preferências de Notificação
      </h2>
      
      <div className="space-y-8">
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-6">
                <Toggle 
                    label="Novidades e Atualizações" 
                    description="Receba resumos semanais sobre o portal e novas features."
                    checked={notifications.email_news}
                    onChange={(val) => setNotifications({...notifications, email_news: val})}
                />
                <Toggle 
                    label="Alertas de Segurança" 
                    description="Notificações importantes sobre logins e alterações de conta."
                    checked={notifications.email_security}
                    onChange={(val) => setNotifications({...notifications, email_security: val})}
                />
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Push Notifications</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-6">
                <Toggle 
                    label="Novos Comentários" 
                    description="Quando alguém comentar em suas publicações."
                    checked={notifications.push_comments}
                    onChange={(val) => setNotifications({...notifications, push_comments: val})}
                />
                <Toggle 
                    label="Atualizações de Pedidos" 
                    description="Status de downloads e interações com fornecedores."
                    checked={notifications.push_orders}
                    onChange={(val) => setNotifications({...notifications, push_orders: val})}
                />
            </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            onClick={handleSaveNotifications}
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
