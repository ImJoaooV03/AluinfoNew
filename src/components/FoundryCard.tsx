import React from 'react';
import { Foundry } from '../types';
import { Phone, Mail, MapPin, CheckCircle, ExternalLink, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegion } from '../contexts/RegionContext';

interface FoundryCardProps {
  foundry: Foundry;
  hideLogo?: boolean;
  hideContactInfo?: boolean;
}

const FoundryCard: React.FC<FoundryCardProps> = ({ foundry, hideLogo = false, hideContactInfo = false }) => {
  const { region } = useRegion();

  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      
      {/* Verified Badge */}
      {foundry.isVerified && (
        <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-bl-sm flex items-center gap-1 border-b border-l border-blue-100 z-10">
            <CheckCircle size={10} />
            VERIFICADO
        </div>
      )}

      {/* Logo Area - Full Width (Conditionally Rendered) */}
      {!hideLogo && (
        <div className="h-40 bg-white flex items-center justify-center border-b border-gray-100 relative group-hover:bg-gray-50 transition-colors overflow-hidden">
            {foundry.logoUrl ? (
                <img 
                    src={foundry.logoUrl} 
                    alt={foundry.name} 
                    className="w-full h-full object-contain p-4 filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                    <Factory size={32} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium mt-1 uppercase tracking-wide">Sem Logo</span>
                </div>
            )}
        </div>
      )}

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Category */}
        <div className="mb-2">
            <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-gray-200">
                {foundry.category}
            </span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">
            {foundry.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed flex-grow">
            {foundry.description}
        </p>

        {/* Contact Info - Conditionally Rendered */}
        {!hideContactInfo && (
            <div className="space-y-2 mb-5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate">{foundry.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone size={12} className="text-gray-400" />
                    <span className="truncate">{foundry.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail size={12} className="text-gray-400" />
                    <span className="truncate">{foundry.email}</span>
                </div>
            </div>
        )}

        {/* Action Button */}
        <Link to={`/${region}/fundicao/${foundry.id}`} className="w-full mt-auto bg-white border border-primary text-primary hover:bg-primary hover:text-white text-xs font-bold py-2 rounded-sm transition-all uppercase flex items-center justify-center gap-2 group/btn">
            Ver Perfil
            <ExternalLink size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Link>
      </div>
    </div>
  );
};

export default FoundryCard;
