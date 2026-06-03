import React from 'react';
import { Play, Info, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero({ movie, onSelect }) {
  const { t } = useLanguage();
  if (!movie) return null;

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] rounded-3xl overflow-hidden mb-12 group bg-[#070708] border border-white/5 shadow-2xl">
      {/* 1. Görsel Alanı (Sağ tarafta konumlanmış) */}
      <div 
        className="absolute right-0 top-0 w-full md:w-[65%] h-full bg-cover bg-center transform scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out"
        style={{ backgroundImage: `url('${movie.thumbnail}')` }}
      />

      {/* 2. PREMIUM GRADYAN MASKELERİ (Sol kenarı tamamen eriten HBO Max tekniği) */}
      
      {/* Masaüstü için */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[40%] bg-[#070708] z-10 hidden md:block" />
      <div className="absolute inset-y-0 left-[40%] w-[30%] bg-gradient-to-r from-[#070708] via-[#070708]/80 to-transparent z-10 hidden md:block" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070708] to-transparent z-10 hidden md:block" />

      {/* Mobil/Tablet için */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/75 to-transparent md:hidden z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/80 via-[#070708]/20 to-transparent md:hidden z-10" />

      {/* 3. İçerik Katmanı (Etkileşim için z-20 z-index ile en üstte) */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 z-20 max-w-3xl space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-extrabold shadow-lg shadow-purple-500/10">
            {t('day_selection')}
          </span>
          {movie.isWeeklyRecommended && (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-extrabold hidden sm:inline-block">
              {t('weekly_recom')}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl select-none">
          {movie.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-medium">
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold">{movie.imdbRating}</span>
          </div>
          <span>IMDb</span>
          <span className="text-gray-600">•</span>
          <span>{movie.releaseYear}</span>
          <span className="text-gray-600">•</span>
          <span>{movie.duration}</span>
          <span className="text-gray-600">•</span>
          <div className="flex gap-1.5">
            {movie.genres.slice(0, 3).map((g, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md text-xs font-semibold text-gray-200">
                {g}
              </span>
            ))}
          </div>
        </div>

        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl drop-shadow-md line-clamp-3 md:line-clamp-4">
          {movie.description}
        </p>

        {movie.curatorReview && (
          <div className="border-l-2 border-purple-500/50 pl-4 py-1 max-w-lg hidden md:block">
            <p className="text-xs italic text-gray-400">
              "{movie.curatorReview}"
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          <button 
            onClick={() => onSelect(movie)}
            className="flex items-center gap-2 bg-white text-black hover:bg-purple-600 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 font-extrabold px-7 py-3.5 rounded-2xl text-sm cursor-pointer shadow-lg shadow-white/5"
          >
            <Play className="w-5 h-5 fill-current" />
            {t('play_now')}
          </button>
          <button 
            onClick={() => onSelect(movie)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 text-white border border-white/10 font-extrabold px-7 py-3.5 rounded-2xl text-sm cursor-pointer shadow-lg"
          >
            <Info className="w-5 h-5" />
            {t('more_info')}
          </button>
        </div>
      </div>
    </section>
  );
}
