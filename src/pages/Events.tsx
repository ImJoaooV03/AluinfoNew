import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { Search, ChevronRight, Calendar, Filter, Loader2 } from 'lucide-react';
import { NewsItem } from '../types';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

const Events = () => {
  const { region, t } = useRegion();
  const [events, setEvents] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterStatus] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
  }, [filterType, region]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select('*')
        .neq('status', 'inactive')
        .eq('region', region); // Filtro por Região

      const today = new Date().toISOString().split('T')[0];
      
      if (filterType === 'upcoming') {
        // Eventos futuros ou que terminam no futuro
        query = query.or(`event_date.gte.${today},end_date.gte.${today}`).order('event_date', { ascending: true });
      } else {
        query = query.lt('event_date', today).order('event_date', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const mappedEvents: NewsItem[] = data.map((item: any) => {
            // Formatação de Data (Intervalo)
            const startDate = new Date(item.event_date);
            const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            const locale = region === 'pt' ? 'pt-BR' : 'en-US';
            let dateStr = startDate.toLocaleDateString(locale, dateOptions);

            if (item.end_date) {
                const endDate = new Date(item.end_date);
                if (startDate.toDateString() !== endDate.toDateString()) {
                    dateStr = `${startDate.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString(locale, dateOptions)}`;
                }
            }

            return {
                id: item.id,
                title: item.title,
                summary: item.description,
                category: item.category || 'Evento',
                date: dateStr,
                location: item.location,
                imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/png?text=Evento',
                type: 'event',
                linkUrl: item.link_url
            };
        });
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link to={`/${region}`} className="hover:text-primary transition-colors">{t('home')}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium">{t('events')}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        <div className="w-full mb-8">
            <div className="hidden md:block">
                <AdSpot position="top_large" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333/fff?text=MAGMA" />
            </div>
            <div className="block md:hidden">
                <AdSpot position="top_large_mobile" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150/333/fff?text=MAGMA" />
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="text-primary" size={32} />
                    {t('events')}
                </h1>
            </div>
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder={t('search') + "..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setFilterStatus('upcoming')}
                        className={`pb-2 text-sm font-bold transition-colors border-b-2 ${
                            filterType === 'upcoming' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Próximos
                    </button>
                    <button 
                        onClick={() => setFilterStatus('past')}
                        className={`pb-2 text-sm font-bold transition-colors border-b-2 ${
                            filterType === 'past' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Realizados
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
                        <p className="text-gray-500 font-medium">Nenhum evento encontrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((item) => (
                            <NewsCard key={item.id} item={item} variant="event" />
                        ))}
                    </div>
                )}
            </div>
            <SidebarAds />
        </div>
      </main>
    </div>
  );
};

export default Events;
