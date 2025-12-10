import React from 'react';
import { Facebook, Linkedin, Twitter, MessageCircle, Link as LinkIcon, Share2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import clsx from 'clsx';

interface SocialShareProps {
  url: string;
  title: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, orientation = 'vertical', className }) => {
  const { addToast } = useToast();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Link copiado para a área de transferência!');
    } catch (err) {
      addToast('error', 'Falha ao copiar o link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const buttonClass = "w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm";

  return (
    <div className={clsx(
      "flex items-center gap-3",
      orientation === 'vertical' ? "flex-col" : "flex-row",
      className
    )}>
      {orientation === 'vertical' && (
        <span className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">SHARE</span>
      )}
      
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(buttonClass, "bg-[#3b5998]")}
        title="Compartilhar no Facebook"
      >
        <Facebook size={18} fill="currentColor" className="stroke-none" />
      </a>

      <a 
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(buttonClass, "bg-[#0077b5]")}
        title="Compartilhar no LinkedIn"
      >
        <Linkedin size={18} fill="currentColor" className="stroke-none" />
      </a>

      <a 
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(buttonClass, "bg-[#1da1f2]")}
        title="Compartilhar no Twitter/X"
      >
        <Twitter size={18} fill="currentColor" className="stroke-none" />
      </a>

      <a 
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(buttonClass, "bg-[#25d366]")}
        title="Compartilhar no WhatsApp"
      >
        <MessageCircle size={18} fill="currentColor" className="stroke-none" />
      </a>

      {/* Mobile Native Share Button (Only visible on mobile if needed, or used as extra option) */}
      <button 
        onClick={handleNativeShare}
        className={clsx(buttonClass, "bg-gray-800 md:hidden")}
        title="Mais opções"
      >
        <Share2 size={18} />
      </button>
      
      {/* Copy Link Button (Desktop mainly) */}
       <button 
        onClick={handleCopyLink}
        className={clsx(buttonClass, "bg-gray-400 hover:bg-gray-500 hidden md:flex")}
        title="Copiar Link"
      >
        <LinkIcon size={18} />
      </button>
    </div>
  );
};

export default SocialShare;
