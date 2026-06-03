import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

export default function MovieSlider({ title, movies, onMovieSelect }) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.7 
        : scrollLeft + clientWidth * 0.7;
      
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white border-l-4 border-purple-500 pl-3">
          {title}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-1.5 bg-[#131315] hover:bg-[#1f1f23] rounded-lg border border-white/5 text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-1.5 bg-[#131315] hover:bg-[#1f1f23] rounded-lg border border-white/5 text-gray-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth"
      >
        {movies.map((movie) => (
          <MovieCard 
            key={movie._id} 
            movie={movie} 
            onClick={() => onMovieSelect(movie)} 
          />
        ))}
      </div>
    </div>
  );
}
