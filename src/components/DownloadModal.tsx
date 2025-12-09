import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import clsx from 'clsx';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => Promise<void>;
  title: string;
  fileName?: string;
  source?: string; // 'technical' or 'ebook'
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onSuccess, title, fileName, source = 'technical' }) => {
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

  const validateEmail = (email: string) => {
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
      // 1. Save Lead to Supabase
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{
            email,
            source: source,
            asset_name: title,
            created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      // 2. Trigger parent success (download)
      await onSuccess(email);
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Lead capture error:', err);
      setError('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="bg-primary p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="bg-white/20 p-2 rounded-full">
                <Download size={24} />
            </div>
            <h2 className="text-xl font-bold">Download de Material</h2>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            Você está prestes a baixar: <br/>
            <span className="font-bold text-white">{title}</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sucesso!</h3>
              <p className="text-gray-600 text-sm">
                Seu download iniciará automaticamente em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="lead-email" className="block text-sm font-bold text-gray-700">
                  Informe seu e-mail corporativo para continuar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
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
                      "block w-full pl-10 pr-3 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      error 
                        ? "border-red-300 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-300" 
                        : "border-gray-300 focus:border-primary text-gray-900 placeholder-gray-400"
                    )}
                    placeholder="seu.nome@empresa.com"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1 animate-in slide-in-from-top-1">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Baixar Agora
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                    Ao baixar, você concorda em receber comunicações do AluInfo.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
