import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';
import { useRegion } from '../contexts/RegionContext';

export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  link_url?: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlay?: boolean;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides: propSlides, autoPlay = true }) => {
  const { region } = useRegion();
  const [internalSlides, setInternalSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(!propSlides);

  const slides = propSlides || internalSlides;

  useEffect(() => {
    if (propSlides) {
      setLoading(false);
      return;
    }

    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('status', 'active')
          .eq('region', region) // Filtro por Região
          .order('display_order', { ascending: true });

        if (!error && data) {
          setInternalSlides(data);
        }
      } catch (err) {
        console.error('Erro ao buscar slides:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [propSlides, region]); // Recarregar quando a região mudar

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, nextSlide, slides.length]);

  if (loading) return <div className="w-full h-32 md:h-48 lg:h-64 bg-gray-200 animate-pulse"></div>;
  if (slides.length === 0) return null;

  return (
    <div 
      className="relative w-full h-32 md:h-48 lg:h-64 group overflow-hidden bg-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(
              "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {slide.link_url ? (
                <a href={slide.link_url} className="block w-full h-full cursor-pointer">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                </a>
            ) : (
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-primary transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-primary transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className={clsx("w-2 h-2 rounded-full transition-all duration-300 shadow-sm", index === currentIndex ? "bg-primary w-6" : "bg-white/70 hover:bg-white")} />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
