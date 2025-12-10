import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { 
  User, Lock, Bell, Monitor, Save, Loader2, Camera, 
  CheckCircle, AlertCircle, Shield, Moon, Globe, Mail
} from 'lucide-react';
import clsx from 'clsx';

// Tipos para o estado do formulário
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface NotificationSettings {
  email_news: boolean;
  email_security: boolean;
  push_comments: boolean;
  push_orders: boolean;
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Estados dos Dados
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
    avatar_url: '',
    role: ''
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_news: true,
    email_security: true,
    push_comments: false,
    push_orders: true
  });

  const [system, setSystem] = useState<SystemSettings>({
    theme: 'light',
    language: 'pt'
  });

  // Upload de Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Limpar toast automaticamente
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 1. Get Auth User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // 2. Get Profile Data
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
      showToast('error', 'Falha ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // 1. Upload Avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // 2. Update Profile Table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // 3. Update Auth Metadata (optional but good for sync)
      await supabase.auth.updateUser({
        data: { full_name: profile.full_name, avatar_url: avatarUrl }
      });

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      setAvatarFile(null);
      showToast('success', 'Perfil atualizado com sucesso!');

    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      showToast('error', 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('error', 'As senhas não coincidem.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('error', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      showToast('success', 'Senha alterada com sucesso!');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      showToast('error', err.message || 'Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    // Mock save
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('success', 'Preferências de notificação salvas.');
    }, 800);
  };

  const handleSaveSystem = () => {
    // Mock save
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('success', 'Configurações do sistema atualizadas.');
    }, 800);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'system', label: 'Sistema', icon: Monitor },
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

        {/* Toast Notification */}
        {toast && (
          <div className={clsx(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300",
            toast.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
          )}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation - REMOVIDO 'sticky top-24' */}
          <div className="lg:w-64 flex-shrink-0">
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
          <div className="flex-1">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Meu Perfil</h2>
                
                <div className="space-y-8">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-primary">
                        {avatarPreview || profile.avatar_url ? (
                          <img 
                            src={avatarPreview || profile.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-medium text-3xl">
                            {getInitials(profile.full_name)}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-primary border-2 border-white text-white p-2 rounded-full shadow-md hover:bg-primary-hover transition-transform hover:scale-105"
                        title="Alterar foto"
                      >
                        <Camera size={16} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-gray-900 text-lg">Foto de Perfil</h3>
                      <p className="text-sm text-gray-500 mt-1">Recomendado: 400x400px, JPG ou PNG.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome Completo</label>
                      <input 
                        type="text" 
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">E-mail</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                        </div>
                        <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium">Não editável</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Cargo / Função</label>
                      <input 
                        type="text" 
                        value={profile.role}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 capitalize cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Segurança</h2>
                
                <div className="space-y-8">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Lock size={16} className="text-primary" /> Alterar Senha
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nova Senha</label>
                        <input 
                          type="password" 
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirmar Senha</label>
                        <input 
                          type="password" 
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button 
                          onClick={handleSavePassword}
                          disabled={saving || !passwords.newPassword}
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary px-4 py-2 rounded-md text-sm font-bold transition-all disabled:opacity-50"
                        >
                          Atualizar Senha
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Preferências de Notificação</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</h3>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Novidades e Atualizações</p>
                        <p className="text-xs text-gray-500">Receba resumos semanais sobre o portal.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifications.email_news}
                          onChange={(e) => setNotifications({...notifications, email_news: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Alertas de Segurança</p>
                        <p className="text-xs text-gray-500">Notificações sobre logins suspeitos.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifications.email_security}
                          onChange={(e) => setNotifications({...notifications, email_security: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Preferências do Sistema</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Moon size={16} className="text-primary" /> Aparência
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setSystem({...system, theme: 'light'})}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-center transition-all",
                          system.theme === 'light' ? "border-primary bg-orange-50" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="w-full h-20 bg-gray-100 rounded mb-3 border border-gray-200"></div>
                        <span className="text-sm font-bold text-gray-700">Claro</span>
                      </button>
                      <button 
                        onClick={() => setSystem({...system, theme: 'dark'})}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-center transition-all",
                          system.theme === 'dark' ? "border-primary bg-orange-50" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="w-full h-20 bg-gray-800 rounded mb-3 border border-gray-700"></div>
                        <span className="text-sm font-bold text-gray-700">Escuro</span>
                      </button>
                      <button 
                        onClick={() => setSystem({...system, theme: 'system'})}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-center transition-all",
                          system.theme === 'system' ? "border-primary bg-orange-50" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-800 rounded mb-3 border border-gray-300"></div>
                        <span className="text-sm font-bold text-gray-700">Automático</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Globe size={16} className="text-primary" /> Idioma
                    </h3>
                    <select 
                      value={system.language}
                      onChange={(e) => setSystem({...system, language: e.target.value as any})}
                      className="w-full md:w-1/2 px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="pt">Português (Brasil)</option>
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={handleSaveSystem}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Aplicar Configurações
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
