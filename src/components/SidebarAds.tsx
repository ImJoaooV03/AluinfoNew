import React, { useEffect, useState } from 'react';
import AdSpot from './AdSpot';
import NewsletterWidget from './NewsletterWidget';
import SectionHeader from './SectionHeader';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegion } from '../contexts/RegionContext';
import { supabase } from '../lib/supabaseClient';
import clsx from 'clsx';

const SidebarAds = ({ mostReadNews }: { mostReadNews?: any[] }) => {
  const { region, t } = useRegion();
  const [internalMostRead, setInternalMostRead] = useState<any[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState(true);
  const [indicators, setIndicators] = useState({
    price: '$2868.00',
    change: '+1.40%'
  });

  // Data atual formatada para a região
  const currentDate = new Date().toLocaleDateString(
    region === 'pt' ? 'pt-BR' : region === 'mx' ? 'es-MX' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch Most Read News (if not provided)
    if (!mostReadNews) {
        const fetchMostRead = async () => {
            try {
                // Clear previous state
                setInternalMostRead([]);
                
                const { data } = await supabase
                    .from('news')
                    .select('id, title')
                    .eq('region', region) // STRICT ISOLATION
                    .eq('status', 'published')
                    .order('views', { ascending: false })
                    .limit(4);
                
                if (isMounted && data) setInternalMostRead(data);
            } catch (error) {
                console.error('Erro ao buscar mais lidas:', error);
            }
        };
        fetchMostRead();
    }

    // 2. Fetch LME Indicators
    const fetchIndicators = async () => {
        try {
            setLoadingIndicators(true);
            const { data } = await supabase
                .from('market_indicators')
                .select('aluminum_price, aluminum_change')
                .eq('region', region)
                .maybeSingle();
            
            if (isMounted && data) {
                setIndicators({
                    price: data.aluminum_price || '$0.00',
                    change: data.aluminum_change || '0.00%'
                });
            } else if (isMounted) {
                // Reset to default if no data found for region
                setIndicators({ price: '$0.00', change: '0.00%' });
            }
        } catch (error) {
            console.error('Erro ao buscar indicadores:', error);
        } finally {
            if (isMounted) setLoadingIndicators(false);
        }
    };
    fetchIndicators();

    return () => {
        isMounted = false;
    };

  }, [region, mostReadNews]);

  const newsToList = mostReadNews || internalMostRead;

  // Placeholder URL com texto traduzido
  const getPlaceholder = (text: string) => 
    `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;

  const advertiseText = t('advertiseHere');

  return (
    <aside className="lg:col-span-3 space-y-6">
        <div className="w-full">
                <SectionHeader title={t('lmeIndicators')} icon={<TrendingUp size={20} />} hasButton={false} />
                <div className="bg-white border border-gray-200 p-4 rounded-sm w-full shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <div><h4 className="font-bold text-gray-800 text-sm">{t('aluminum')}</h4><span className="text-xs text-gray-500">AL</span></div>
                    <div className="text-right">
                        {loadingIndicators ? (
                            <div className="flex flex-col items-end gap-1 animate-pulse">
                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="font-bold text-gray-900 text-lg">{indicators.price}</div>
                                <div className={clsx(
                                    "text-[11px] font-bold",
                                    indicators.change.includes('-') ? "text-red-600" : "text-green-600"
                                )}>
                                    {indicators.change}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2 capitalize">{currentDate}</div>
                </div>
        </div>

        <AdSpot 
            position="sidebar_1" 
            className="w-full bg-white border border-gray-200 p-1" 
            fallbackImage={getPlaceholder(advertiseText)}
        />
        <AdSpot 
            position="sidebar_2" 
            className="w-full bg-white border border-gray-200 p-1" 
            fallbackImage={getPlaceholder(advertiseText)}
        />

        <NewsletterWidget />

        <AdSpot 
            position="sidebar_3" 
            className="w-full bg-white border border-gray-200 p-1" 
            fallbackImage={getPlaceholder(advertiseText)}
        />
        <AdSpot 
            position="sidebar_4" 
            className="w-full bg-white border border-gray-200 p-1" 
            fallbackImage={getPlaceholder(advertiseText)}
        />

        {newsToList && newsToList.length > 0 && (
            <div className="bg-white border border-gray-200 p-4 rounded-sm w-full">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-sm">{t('mostRead')}</h3>
                <ul className="space-y-3">
                {newsToList.slice(0, 4).map((item, i) => (
                    <li key={item.id} className="flex gap-3 items-start group cursor-pointer">
                        <span className="text-2xl font-bold text-gray-200 leading-none group-hover:text-primary transition-colors">{i + 1}</span>
                        <Link to={`/${region}/noticia/${item.id}`} className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-900">
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
