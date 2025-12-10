import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { UserProfile } from '../../../types/settings';
import { useToast } from '../../../contexts/ToastContext';
import { Camera, Save, Loader2, Mail, User } from 'lucide-react';

interface ProfileSettingsProps {
  initialProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ initialProfile, onUpdate }) => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validação de tamanho (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'A imagem deve ter no máximo 2MB.');
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      addToast('error', 'O nome completo é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // 1. Upload Avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // 2. Update Profile Table (Using upsert to handle missing rows)
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // 3. Update Auth Metadata
      await supabase.auth.updateUser({
        data: { full_name: profile.full_name, avatar_url: avatarUrl }
      });

      const updatedProfile = { ...profile, avatar_url: avatarUrl };
      setProfile(updatedProfile);
      onUpdate(updatedProfile);
      setAvatarFile(null);
      addToast('success', 'Perfil atualizado com sucesso!');

    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      addToast('error', 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <User className="text-primary" size={24} />
        Meu Perfil
      </h2>
      
      <div className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-primary ring-2 ring-gray-100">
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
              className="absolute bottom-1 right-1 bg-primary border-2 border-white text-white p-2 rounded-full shadow-md hover:bg-primary-hover transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
            <p className="text-xs text-gray-400 mt-1">Máximo: 2MB</p>
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
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Seu nome completo"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">E-mail</label>
            <div className="relative">
              <input 
                type="email" 
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
              </div>
              <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded">Não editável</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Cargo / Função</label>
            <input 
              type="text" 
              value={profile.role}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 capitalize cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
