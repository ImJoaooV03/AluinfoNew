import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';
import { Link } from 'react-router-dom';

interface RelatedNewsCarouselProps {
  items: NewsItem[];
}

const RelatedNewsCarousel: React.FC<RelatedNewsCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2); // Default to 2

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1); // Mobile: 1 card
      } else {
        setItemsPerView(2); // Desktop & Tablet: 2 cards (Changed from 3)
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index to prevent empty space at the end
  const maxIndex = Math.max(0, items.length - itemsPerView);

  // Reset index if it goes out of bounds on resize
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [itemsPerView, maxIndex]);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group">
      {/* Carousel Track Container */}
      <div className="overflow-hidden -mx-3 p-3"> {/* Negative margin to compensate for item padding */}
        <div 
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <Link 
                to={`/noticia/${item.id}`} 
                onClick={() => window.scrollTo(0,0)} 
                className="block h-full"
              >
                <NewsCard item={item} variant="highlight" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show if there are more items than view */}
      {maxIndex > 0 && (
        <>
          <button 
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 bg-white border border-gray-200 shadow-lg p-2 rounded-full text-gray-700 hover:text-primary hover:border-primary disabled:opacity-0 disabled:pointer-events-none transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            disabled={currentIndex === maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 bg-white border border-gray-200 shadow-lg p-2 rounded-full text-gray-700 hover:text-primary hover:border-primary disabled:opacity-0 disabled:pointer-events-none transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedNewsCarousel;
