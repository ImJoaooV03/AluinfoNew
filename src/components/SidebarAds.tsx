import React from 'react';
import AdSpot from './AdSpot';
import NewsletterWidget from './NewsletterWidget';
import SectionHeader from './SectionHeader';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarAds = ({ mostReadNews }: { mostReadNews?: any[] }) => {
  return (
    <aside className="lg:col-span-3 space-y-6">
        
        {/* LME Indicators Widget */}
        <div className="w-full">
                <SectionHeader title="Indicadores LME" icon={<TrendingUp size={20} />} hasButton={false} />
                <div className="bg-white border border-gray-200 p-4 rounded-sm w-full shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">ALUMÍNIO</h4>
                        <span className="text-xs text-gray-500">AL</span>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">$2868.00</div>
                        <div className="text-[11px] text-green-600 font-bold">+1.40%</div>
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
                    1 de dezembro de 2025
                </div>
                </div>
        </div>

        {/* Banner Lateral 1 - Auto Height */}
        <AdSpot 
            position="sidebar_1" 
            className="w-full bg-white border border-gray-200 p-1"
            fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/eee/999?text=Anuncie+Aqui+(Lateral+1)"
        />

        {/* Banner Lateral 2 */}
        <AdSpot 
            position="sidebar_2" 
            className="w-full bg-white border border-gray-200 p-1"
            fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/eee/999?text=Anuncie+Aqui+(Lateral+2)"
        />

        {/* Newsletter */}
        <NewsletterWidget />

        {/* Banner Lateral 3 */}
        <AdSpot 
            position="sidebar_3" 
            className="w-full bg-white border border-gray-200 p-1"
            fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/eee/999?text=Anuncie+Aqui+(Lateral+3)"
        />

        {/* Banner Lateral 4 */}
        <AdSpot 
            position="sidebar_4" 
            className="w-full bg-white border border-gray-200 p-1"
            fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/eee/999?text=Anuncie+Aqui+(Lateral+4)"
        />

        {/* Most Read Widget */}
        {mostReadNews && mostReadNews.length > 0 && (
            <div className="bg-white border border-gray-200 p-4 rounded-sm w-full">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-sm">Mais Lidas</h3>
                <ul className="space-y-3">
                {mostReadNews.slice(0, 4).map((item, i) => (
                    <li key={item.id} className="flex gap-3 items-start group cursor-pointer">
                        <span className="text-2xl font-bold text-gray-200 leading-none group-hover:text-primary transition-colors">{i + 1}</span>
                        <Link to={`/noticia/${item.id}`} className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-900">
                            {item.title}
                        </Link>
                    </li>
                ))}
                </ul>
            </div>
        )}
    </aside>
  );
};

export default SidebarAds;
