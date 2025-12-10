import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';

export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  link_url?: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[]; // Optional prop for controlled mode (Admin Preview)
  autoPlay?: boolean;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides: propSlides, autoPlay = true }) => {
  const [internalSlides, setInternalSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(!propSlides);

  // Use props if available, otherwise fetch from Supabase
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
  }, [propSlides]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, nextSlide, slides.length]);

  if (loading) {
    return <div className="w-full h-32 md:h-48 lg:h-64 bg-gray-200 animate-pulse"></div>;
  }

  // If no slides (and not loading), don't render anything (or render placeholder if desired)
  if (slides.length === 0) {
    return null; 
  }

  return (
    <div 
      className="relative w-full h-32 md:h-48 lg:h-64 group overflow-hidden bg-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(
              "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Link Wrapper (Optional) */}
            {slide.link_url ? (
                <a href={slide.link_url} className="block w-full h-full cursor-pointer">
                    <SlideContent slide={slide} />
                </a>
            ) : (
                <SlideContent slide={slide} />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Only if > 1 slide) */}
      {slides.length > 1 && (
        <>
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>
            
            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={clsx(
                    "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                    index === currentIndex 
                        ? "bg-primary w-6" 
                        : "bg-white/70 hover:bg-white"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

// Helper component for content rendering - CLEAN VERSION (Image Only)
const SlideContent = ({ slide }: { slide: HeroSlide }) => (
    <>
        {/* Background Image Only */}
        <img 
            src={slide.image_url} 
            alt={slide.title} 
            className="w-full h-full object-cover"
        />
    </>
);

export default HeroCarousel;
