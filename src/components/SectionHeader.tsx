import React from 'react';
import { Rss } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  hasButton?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, hasButton = true }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-primary">
            {icon || <Rss size={20} />}
        </span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {hasButton && (
        <button className="text-xs font-medium text-gray-500 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
          Ver tudo
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
