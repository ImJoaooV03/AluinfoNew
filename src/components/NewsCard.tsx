import React from 'react';
import { NewsItem } from '../types';
import { Calendar, User, MapPin, FileText } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  variant?: 'highlight' | 'compact' | 'technical' | 'ebook' | 'event';
}

const NewsCard: React.FC<NewsCardProps> = ({ item, variant = 'highlight' }) => {
  if (variant === 'technical') {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-5 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1 border border-gray-200">
                <FileText size={12} className="text-gray-500" /> PDF
            </span>
            <span className="text-[11px] text-gray-400 font-medium">{item.downloads} Downloads</span>
        </div>
        
        <h3 className="font-bold text-sm text-gray-900 mb-3 leading-snug line-clamp-2 min-h-[40px]">
            {item.title}
        </h3>
        
        <p className="text-xs text-gray-500 mb-6 line-clamp-3 flex-grow leading-relaxed">
            {item.summary}
        </p>
        
        <button className="w-full bg-[#F37021] hover:bg-[#d65a12] text-white text-xs font-bold py-2.5 rounded-sm transition-colors uppercase tracking-wide mt-auto shadow-sm">
          Baixar
        </button>
      </div>
    );
  }

  if (variant === 'ebook') {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex gap-4 mb-4">
            <div className="w-1/3 flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-auto shadow-sm object-cover aspect-[3/4]" />
            </div>
            <div className="w-2/3">
                 <div className="flex justify-between items-center mb-2">
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">E-book</span>
                    <span className="text-[10px] text-primary font-bold">Grátis</span>
                </div>
                <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight">{item.title}</h3>
                <p className="text-[10px] text-gray-500 mb-2">{item.author}</p>
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-grow">{item.summary}</p>
        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-3">
            <span>{item.pages} páginas</span>
            <span>{item.downloads} Downloads</span>
        </div>
        <button className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded transition-colors uppercase">
          Baixar
        </button>
      </div>
    );
  }

  if (variant === 'event') {
    return (
        <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col h-full hover:shadow-md transition-shadow relative">
            <span className="absolute top-4 left-4 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">Evento</span>
            
            <div className="mt-8 mb-3">
                 {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.title} className="h-12 object-contain mb-2" />
                 ) : (
                     <div className="h-12 w-full bg-gray-50 mb-2"></div>
                 )}
            </div>

            <h3 className="font-bold text-sm text-gray-800 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-grow">{item.summary}</p>
            
            <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <MapPin size={12} />
                    <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Calendar size={12} />
                    <span>{item.date}</span>
                </div>
            </div>

            <div className="flex justify-end mt-auto">
                 <button className="bg-primary/80 hover:bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors">
                    Saiba mais
                </button>
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
