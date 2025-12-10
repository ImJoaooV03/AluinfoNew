import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Mail, Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import clsx from 'clsx';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => Promise<void>;
  title: string;
  fileName?: string;
  source?: string; // 'technical', 'ebook', 'newsletter', etc.
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  fileName, 
  source = 'technical' 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError(null);
      setIsSuccess(false);
      setIsLoading(false);
      // Focus input for better UX
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle click outside and ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Persist Lead to Supabase
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{
            email,
            source: source,
            asset_name: title,
            created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      // 2. Trigger parent success callback (starts the download)
      await onSuccess(email);
      
      setIsSuccess(true);
      
      // Close modal automatically after success
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err) {
      console.error('Erro na captura de lead:', err);
      setError('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 border border-gray-200"
      >
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors z-10"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10 shadow-inner">
                <Lock size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Conteúdo Exclusivo</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              Para baixar <strong className="text-white">"{title}"</strong>, identifique-se abaixo.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-short">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Download Iniciado!</h3>
              <p className="text-gray-500 text-sm">
                O arquivo foi enviado para seu dispositivo. <br/>
                Obrigado por fazer parte do AluInfo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="lead-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  E-mail
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    ref={inputRef}
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                    }}
                    className={clsx(
                      "block w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      error 
                        ? "border-red-300 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-300" 
                        : "border-gray-300 focus:border-primary text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    )}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 animate-in slide-in-from-top-1 font-medium bg-red-50 p-2 rounded border border-red-100">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Liberando Acesso...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      BAIXAR AGORA
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                    Ao continuar, você concorda em receber atualizações ocasionais do AluInfo. Seus dados estão seguros conosco.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
