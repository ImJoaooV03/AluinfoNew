import React from 'react';
import { NewsItem } from '../types';
import { Calendar, User, MapPin, FileText, Download, ExternalLink } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  variant?: 'highlight' | 'compact' | 'technical' | 'ebook' | 'event';
  onDownloadRequest?: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, variant = 'highlight', onDownloadRequest }) => {
  
  // Helper to handle download click
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (onDownloadRequest && item.fileUrl) {
        e.preventDefault(); // Prevent default link behavior
        onDownloadRequest(item);
    }
  };

  if (variant === 'technical') {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-5 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1 border border-gray-200">
                <FileText size={12} className="text-gray-500" /> {item.category}
            </span>
            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <Download size={10} /> {item.downloads || 0}
            </span>
        </div>
        
        <h3 className="font-bold text-sm text-gray-900 mb-3 leading-snug line-clamp-2 min-h-[40px]" title={item.title}>
            {item.title}
        </h3>
        
        <p className="text-xs text-gray-500 mb-6 line-clamp-3 flex-grow leading-relaxed">
            {item.summary}
        </p>
        
        {item.fileUrl ? (
            <a 
                href={item.fileUrl} 
                onClick={handleDownloadClick}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#F37021] hover:bg-[#d65a12] text-white text-xs font-bold py-2.5 rounded-sm transition-colors uppercase tracking-wide mt-auto shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
                <Download size={14} /> Baixar
            </a>
        ) : (
            <button disabled className="w-full bg-gray-200 text-gray-400 text-xs font-bold py-2.5 rounded-sm uppercase tracking-wide mt-auto cursor-not-allowed">
                Indisponível
            </button>
        )}
      </div>
    );
  }

  if (variant === 'ebook') {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex gap-4 mb-4">
            <div className="w-1/3 flex-shrink-0">
                <img 
                    src={item.imageUrl || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Capa'} 
                    alt={item.title} 
                    className="w-full h-auto shadow-sm object-cover aspect-[3/4] rounded-sm" 
                />
            </div>
            <div className="w-2/3">
                 <div className="flex justify-between items-center mb-2">
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">E-book</span>
                    <span className="text-[10px] text-primary font-bold">Grátis</span>
                </div>
                <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight line-clamp-3">{item.title}</h3>
                {item.author && <p className="text-[10px] text-gray-500 mb-2">{item.author}</p>}
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-grow">{item.summary}</p>
        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-3">
            <span>{item.date}</span>
            <span>{item.downloads || 0} Downloads</span>
        </div>
        
        {item.fileUrl ? (
            <a 
                href={item.fileUrl} 
                onClick={handleDownloadClick}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded transition-colors uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
                <Download size={14} /> Baixar
            </a>
        ) : (
            <button disabled className="w-full bg-gray-200 text-gray-400 text-xs font-bold py-2 rounded uppercase cursor-not-allowed">
                Indisponível
            </button>
        )}
      </div>
    );
  }

  if (variant === 'event') {
    return (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow group">
            
            {/* Image Area - Full Width */}
            <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden border-b border-gray-100">
                 {item.imageUrl ? (
                     <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                     />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Calendar size={32} className="text-gray-300" />
                     </div>
                 )}
                 {/* Badge */}
                 <div className="absolute top-3 left-3">
                    <span className="bg-gray-200/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm">
                        Evento
                    </span>
                 </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {item.summary}
                </p>
                
                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={14} className="text-primary" />
                        <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={14} className="text-primary" />
                        <span>{item.date}</span>
                    </div>
                </div>

                <div className="flex justify-end mt-auto">
                     {item.linkUrl ? (
                        <a 
                            href={item.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            Saiba mais <ExternalLink size={12} />
                        </a>
                     ) : (
                        <button disabled className="bg-gray-100 text-gray-400 text-xs font-bold px-4 py-2 rounded-sm cursor-default">
                            Em breve
                        </button>
                     )}
                </div>
            </div>
        </div>
    )
  }

  if (variant === 'compact') {
    return (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
          <div className="relative overflow-hidden aspect-[4/3]">
            <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2">
                <span className="bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {item.category}
                </span>
            </div>
          </div>
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-3">
                {item.title}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
                <Calendar size={10} />
                <span>{item.date}</span>
            </div>
          </div>
        </div>
    );
  }

  // Default News Highlight
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
      <div className="relative overflow-hidden aspect-video">
        <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                {item.category === 'INOVAÇÃO' ? <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> : null}
                {item.category}
            </span>
            {item.isHighlight && <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded uppercase">Destaque</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors">
            {item.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow leading-relaxed">
            {item.summary}
        </p>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
                <User size={12} />
                <span>{item.author}</span>
            </div>
            <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{item.date}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
