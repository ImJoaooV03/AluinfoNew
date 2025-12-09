import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'blue' | 'green' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendLabel = 'vs. mês anterior', color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx("p-3 rounded-lg", colorStyles[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={clsx(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
    </div>
  );
};

export default StatCard;
