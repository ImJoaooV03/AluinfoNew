import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import clsx from 'clsx';

const NewsletterWidget = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
        setStatus('error');
        setMessage('E-mail inválido.');
        return;
    }

    setLoading(true);
    setStatus('idle');

    try {
        const { error } = await supabase
            .from('leads')
            .insert([{ 
                email, 
                source: 'newsletter',
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        setStatus('success');
        setMessage('Inscrição realizada!');
        setEmail('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 3000);

    } catch (err) {
        console.error('Newsletter error:', err);
        setStatus('error');
        setMessage('Erro ao inscrever. Tente novamente.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-[#151922] p-5 rounded-sm text-center shadow-sm w-full">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
            <Mail size={20} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Newsletter</h3>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Receba as últimas notícias do mercado de alumínio diretamente no seu e-mail.
        </p>
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="relative">
                <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || status === 'success'}
                    className={clsx(
                        "w-full bg-[#1F2530] border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors",
                        status === 'error' ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-primary"
                    )}
                />
            </div>
            
            <button 
                disabled={loading || status === 'success'}
                className={clsx(
                    "w-full text-white text-xs font-bold py-2.5 rounded transition-all uppercase flex items-center justify-center gap-2",
                    status === 'success' 
                        ? "bg-green-600 hover:bg-green-700 cursor-default" 
                        : "bg-primary hover:bg-primary-hover"
                )}
            >
                {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : status === 'success' ? (
                    <>
                        <CheckCircle size={14} /> Inscrito
                    </>
                ) : (
                    'Inscrever-se'
                )}
            </button>

            {/* Feedback Message */}
            {(status === 'error' || status === 'success') && (
                <div className={clsx(
                    "text-[10px] flex items-center justify-center gap-1 animate-in fade-in slide-in-from-top-1",
                    status === 'success' ? "text-green-400" : "text-red-400"
                )}>
                    {status === 'error' && <AlertCircle size={10} />}
                    {message}
                </div>
            )}
        </form>
        
        <p className="text-[10px] text-gray-600 mt-3">
            Política de privacidade garantida.
        </p>
    </div>
  );
};

export default NewsletterWidget;
