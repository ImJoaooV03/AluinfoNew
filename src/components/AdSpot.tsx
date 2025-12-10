import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

interface AdSpotProps {
  position: 'top_large' | 'top_large_mobile' | 'home_middle_1' | 'home_middle_2' | 'home_final' | 'sidebar_1' | 'sidebar_2' | 'sidebar_3' | 'sidebar_4';
  className?: string;
  fallbackImage?: string;
}

const AdSpot: React.FC<AdSpotProps> = ({ position, className = "", fallbackImage }) => {
  const { region } = useRegion();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('position', position)
          .eq('status', 'active')
          .eq('region', region) // Region Filter
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setAd(data);
          await supabase.rpc('increment_ad_views', { ad_id: data.id });
        } else {
            setAd(null); // Reset if no ad found for this region
        }
      } catch (err) {
        console.error(`Erro ao buscar anúncio ${position}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [position, region]);

  const handleClick = async () => {
    if (ad?.id) {
      supabase.rpc('increment_ad_clicks', { ad_id: ad.id });
    }
  };

  if (loading) {
    return <div className={`bg-gray-100 animate-pulse rounded-sm min-h-[50px] ${className}`}></div>;
  }

  if (!ad) {
    if (fallbackImage) {
        return (
            <div className={`overflow-hidden rounded-sm shadow-sm ${className}`}>
                <img 
                  src={fallbackImage} 
                  alt="Espaço Publicitário" 
                  className="w-full h-auto block" 
                />
            </div>
        );
    }
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {ad.link_url ? (
        <a 
            href={ad.link_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="block w-full"
        >
          <img 
            src={ad.image_url} 
            alt={ad.title} 
            className="w-full h-auto block" 
          />
        </a>
      ) : (
        <img 
          src={ad.image_url} 
          alt={ad.title} 
          className="w-full h-auto block" 
        />
      )}
    </div>
  );
};

export default AdSpot;
