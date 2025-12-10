import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../contexts/ToastContext';
import { validatePassword } from '../../../utils/validation';
import { Shield, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

const SecuritySettings = () => {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    match: false
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValues = { ...passwords, [name]: value };
    setPasswords(newValues);

    // Live validation
    if (name === 'newPassword' || name === 'confirmPassword') {
        const pwd = name === 'newPassword' ? value : passwords.newPassword;
        const confirm = name === 'confirmPassword' ? value : passwords.confirmPassword;
        
        setValidation({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            match: pwd === confirm && pwd.length > 0
        });
    }
  };

  const handleSavePassword = async () => {
    const { isValid, message } = validatePassword(passwords.newPassword);
    
    if (!isValid) {
      addToast('error', message || 'Senha inválida');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('error', 'As senhas não coincidem.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      addToast('success', 'Senha alterada com sucesso!');
      setPasswords({ newPassword: '', confirmPassword: '' });
      setValidation({ length: false, uppercase: false, number: false, match: false });
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      addToast('error', err.message || 'Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={clsx("flex items-center gap-2 text-xs", valid ? "text-green-600" : "text-gray-400")}>
        {valid ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
        <span>{text}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <Shield className="text-primary" size={24} />
        Segurança
      </h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={16} className="text-gray-500" /> Alterar Senha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nova Senha</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirmar Senha</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {/* Validation Checklist */}
            <div className="md:col-span-2 grid grid-cols-2 gap-2 mt-2">
                <ValidationItem valid={validation.length} text="Mínimo de 8 caracteres" />
                <ValidationItem valid={validation.uppercase} text="Pelo menos uma letra maiúscula" />
                <ValidationItem valid={validation.number} text="Pelo menos um número" />
                <ValidationItem valid={validation.match} text="Senhas coincidem" />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-200/50">
              <button 
                onClick={handleSavePassword}
                disabled={saving || !passwords.newPassword || !validation.match}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Atualizar Senha
              </button>
            </div>
          </div>
        </div>

        {/* 2FA Section Placeholder */}
        <div className="opacity-50 pointer-events-none">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-gray-500" /> Autenticação de Dois Fatores (2FA)
            </h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Proteger conta com 2FA</p>
                    <p className="text-xs text-gray-500 mt-1">Adiciona uma camada extra de segurança.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary"></div>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">Disponível em breve.</p>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
