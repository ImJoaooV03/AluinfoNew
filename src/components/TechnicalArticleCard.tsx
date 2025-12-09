import React from 'react';
import { Article } from '../types';
import { Clock, Calendar } from 'lucide-react';

interface TechnicalArticleCardProps {
  article: Article;
}

const TechnicalArticleCard: React.FC<TechnicalArticleCardProps> = ({ article }) => {
  return (
    <div className="group bg-white rounded-sm overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Zoom Effect */}
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Category Tag Overlay */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
          {article.summary}
        </p>

        {/* Footer: Author & Meta */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {article.authorAvatar ? (
              <img 
                src={article.authorAvatar} 
                alt={article.author} 
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                {article.author?.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-900 leading-none mb-0.5">{article.author}</span>
              <span className="text-[10px] text-gray-500 leading-none">{article.authorRole || 'Autor'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-[10px] text-gray-400 font-medium">
             <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{article.date.split(',')[0]}</span>
             </div>
             <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{article.readTime}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalArticleCard;
