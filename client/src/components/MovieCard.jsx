import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export function MovieCard({ movie, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let timer;
    if (isHovered && movie.youtubeId) {
      timer = setTimeout(() => {
        setShowTrailer(true);
      }, 1000); // 1 saniye hover kalırsa fragman oynatılır
    } else {
      setShowTrailer(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered, movie.youtubeId]);

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-shrink-0 w-[160px] md:w-[195px] cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-purple-500/50 transition-all duration-500 shadow-lg shadow-black bg-[#111113]">
        {showTrailer ? (
          <iframe
            src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`}
            title=""
            className="w-full h-full object-cover scale-[1.3] pointer-events-none"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <img 
            src={movie.thumbnail} 
            alt={movie.title}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hızlı Detay Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-1 z-20">
          <div className="flex items-center gap-1 text-[11px] text-yellow-500 bg-yellow-500/10 w-fit px-1.5 py-0.5 rounded font-bold border border-yellow-500/20">
            <Star className="w-3 h-3 fill-yellow-500" />
            <span>{movie.imdbRating}</span>
          </div>
          <p className="text-white text-xs font-bold truncate">{movie.title}</p>
          <p className="text-[10px] text-gray-400">{movie.releaseYear} • {movie.genres[0]}</p>
        </div>
      </div>
      
      {/* Normal Durum Bilgileri */}
      <div className="mt-3 group-hover:opacity-0 transition-opacity duration-300">
        <h4 className="text-white font-semibold text-xs truncate">{movie.title}</h4>
        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-0.5">
          <span>{movie.releaseYear} • {movie.genres[0]}</span>
          <span className="text-yellow-500 font-bold">★ {movie.imdbRating}</span>
        </div>
      </div>
    </div>
  );
}
export default MovieCard;
