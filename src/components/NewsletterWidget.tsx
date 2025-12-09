import React from 'react';
import { Mail } from 'lucide-react';

const NewsletterWidget = () => {
  return (
    <div className="bg-[#151922] p-5 rounded-sm text-center shadow-sm w-full">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
            <Mail size={20} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Newsletter</h3>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Receba as últimas notícias do mercado de alumínio diretamente no seu e-mail.
        </p>
        
        <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
                type="text" 
                placeholder="Nome" 
                className="w-full bg-[#1F2530] border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors" 
            />
            <input 
                type="email" 
                placeholder="E-mail" 
                className="w-full bg-[#1F2530] border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors" 
            />
            <button className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded transition-colors uppercase flex items-center justify-center gap-2">
                Inscrever-se
            </button>
        </form>
        <p className="text-[10px] text-gray-600 mt-3">
            Política de privacidade garantida.
        </p>
    </div>
  );
};

export default NewsletterWidget;
