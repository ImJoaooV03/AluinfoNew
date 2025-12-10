import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { User, Bell, Loader2, Shield, Mail } from 'lucide-react';
import clsx from 'clsx';
import { UserProfile } from '../../types/settings';
import { useToast } from '../../contexts/ToastContext';

// Import Sub-components
import ProfileSettings from '../../components/admin/settings/ProfileSettings';
import SecuritySettings from '../../components/admin/settings/SecuritySettings';
import NotificationSettings from '../../components/admin/settings/NotificationSettings';

const AdminSettings = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
    avatar_url: '',
    role: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
        role: profileData?.role || 'user'
      });
      
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err);
      addToast('error', 'Falha ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500">Gerencie suas preferências e dados da conta.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation - Agora estático (sem sticky) */}
          <div className="lg:w-64 flex-shrink-0 w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <nav className="flex flex-col p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                        isActive 
                          ? "bg-orange-50 text-primary shadow-sm" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon size={18} className={isActive ? "text-primary" : "text-gray-400"} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {activeTab === 'profile' && (
              <ProfileSettings initialProfile={profile} onUpdate={setProfile} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
