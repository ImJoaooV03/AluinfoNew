import React from 'react';
import { Menu, Bell, Search, ChevronDown, ExternalLink } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { region } = useRegion();

  const getRegionLabel = () => {
    switch(region) {
      case 'pt': return 'Brasil 🇧🇷';
      case 'mx': return 'México 🇲🇽';
      case 'en': return 'Global 🌎';
      default: return region.toUpperCase();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative w-64 lg:w-96">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar no painel..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* View Site Button */}
        <a 
          href={`/${region}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary border border-primary/30 bg-orange-50 rounded-md hover:bg-primary hover:text-white transition-all"
          title={`Ver portal ${getRegionLabel()}`}
        >
          <ExternalLink size={14} />
          Ver Portal {region.toUpperCase()}
        </a>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">{getRegionLabel()}</p>
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
            <img src="https://i.pravatar.cc/150?u=1" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <ChevronDown size={16} className="text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
