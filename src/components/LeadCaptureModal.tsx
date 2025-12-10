import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Mail, Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';
import clsx from 'clsx';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => Promise<void>;
  title: string;
  fileName?: string;
  source?: string;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  source = 'technical' 
}) => {
  const { region } = useRegion(); // Hook da região
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError(null);
      setIsSuccess(false);
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ... (Event listeners for ESC/Click Outside remain same) ...

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !validateEmail(email)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    setIsLoading(true);

    try {
      // Salvar Lead com a Região Atual
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{
            email,
            source: source,
            asset_name: title,
            region: region, // Salva a região
            created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      await onSuccess(email);
      
      setIsSuccess(true);
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
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors z-10">
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="lead-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide">E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    ref={inputRef}
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                    className={clsx("block w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all", error ? "border-red-300 bg-red-50 text-red-900" : "border-gray-300 focus:border-primary")}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2"><AlertCircle size={12} /><span>{error}</span></div>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Download size={20} /> BAIXAR AGORA</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
