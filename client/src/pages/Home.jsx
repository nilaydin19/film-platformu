import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import MovieSlider from '../components/MovieSlider';
import { Search, Flame, User, Play, X, Film, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import MovieCard from '../components/MovieCard'; // 🔥 SÜSLÜ PARANTEZ HATASI GİDERİLDİ 🔥
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ onMovieSelect }) {
  const { user, token } = useAuth(); // Global token entegre edildi
  const { language, setLanguage, t } = useLanguage();
  
  const [movies, setMovies] = useState([]);
  const [curatorPlaylists, setCuratorPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('Tümü');

  // Akordiyon Eyaletleri
  const [isLangAccordionOpen, setIsLangAccordionOpen] = useState(false);

  // Küratör Detay Modal Eyaleti
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const genresList = ['Tümü', 'Romantik Komedi', 'Komedi', 'Romantik', 'Dram', 'Korku', 'Bilim Kurgu', 'Gerilim', 'Aksiyon'];
  
  const languageFilters = [
    { key: 'Tümü', labelKey: 'all' },
    { key: 'Türkçe', labelKey: 'turkish' },
    { key: 'İngilizce', labelKey: 'english' },
    { key: 'Rusça', labelKey: 'russian' },
    { key: 'Almanca', labelKey: 'german' },
    { key: 'Fransızca', labelKey: 'french' }
  ];

  const getGenreLabel = (genreKey) => {
    const genreMap = {
      'Tümü': t('all'),
      'Romantik Komedi': language === 'tr' ? 'Romantik Komedi' : language === 'en' ? 'Romantic Comedy' : language === 'ru' ? 'Романтическая комедия' : language === 'de' ? 'Liebeskomödie' : 'Comédie Romantique',
      'Komedi': language === 'tr' ? 'Komedi' : language === 'en' ? 'Comedy' : language === 'ru' ? 'Комедия' : language === 'de' ? 'Komödie' : 'Comédie',
      'Romantik': language === 'tr' ? 'Romantik' : language === 'en' ? 'Romance' : language === 'ru' ? 'Мелодрама' : language === 'de' ? 'Romantik' : 'Romance',
      'Dram': language === 'tr' ? 'Dram' : language === 'en' ? 'Drama' : language === 'ru' ? 'Драма' : language === 'de' ? 'Drama' : 'Drame',
      'Korku': language === 'tr' ? 'Korku' : language === 'en' ? 'Horror' : language === 'ru' ? 'Ужасы' : language === 'de' ? 'Horror' : 'Horreur',
      'Bilim Kurgu': language === 'tr' ? 'Bilim Kurgu' : language === 'en' ? 'Sci-Fi' : language === 'ru' ? 'Фантастика' : language === 'de' ? 'Sci-Fi' : 'Science-Fiction',
      'Gerilim': language === 'tr' ? 'Gerilim' : language === 'en' ? 'Thriller' : language === 'ru' ? 'Триллер' : language === 'de' ? 'Thriller' : 'Thriller',
      'Aksiyon': language === 'tr' ? 'Aksiyon' : language === 'en' ? 'Action' : language === 'ru' ? 'Экшен' : language === 'de' ? 'Action' : 'Action'
    };
    return genreMap[genreKey] || genreKey;
  };

  useEffect(() => {
    fetchMovies();
    fetchCuratorPlaylists();
  }, [token]); // Token yenilenirse verileri tazeleyecek tetikleyici

  const fetchMovies = async () => {
    try {
      const response = await fetch('https://film-platformu.onrender.com/api/movies', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMovies(data || []);
      }
    } catch (err) {
      console.error('İçerikler çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuratorPlaylists = async () => {
    try {
      const response = await fetch('https://film-platformu.onrender.com/api/playlists/all', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCuratorPlaylists(data || []);
      }
    } catch (err) {
      console.error('Keşfet listeleri çekilemedi:', err);
    }
  };

  // 🔥 ÇOCUK PROFİLİ İÇERİK SÜZGECİNİ %100 GARANTİLİ YAPAN AKILLI BLOK 🔥
  const activeProfile = user?.profiles?.find(p => String(p._id || p.id) === String(user?.activeProfileId));
  const profileNameLower = String(activeProfile?.name || '').toLowerCase();
  const isKidsActive = activeProfile?.isKids === true || 
                       activeProfile?.isKids === 1 || 
                       String(activeProfile?.isKids) === 'true' ||
                       profileNameLower.includes('çocuk') || 
                       profileNameLower.includes('cocuk') || 
                       profileNameLower.includes('kids');

  const allowedMovies = isKidsActive
    ? movies.filter(m => {
        const isKidsTagged = m.isKids === true || m.isKids === 1 || String(m.isKids) === 'true';
        const hasKidsGenre = m.genres?.some(g => {
          const genreLower = String(g).toLowerCase();
          return genreLower.includes('animasyon') || 
                 genreLower.includes('çizgi') || 
                 genreLower.includes('çocuk') || 
                 genreLower.includes('aile') || 
                 genreLower.includes('kids');
        });
        return isKidsTagged || hasKidsGenre;
      })
    : movies;

  const allowedPlaylists = isKidsActive
    ? curatorPlaylists.map(pl => {
        const kidsMovies = pl.movies?.filter(m => {
          const isKidsTagged = m.isKids === true || m.isKids === 1 || String(m.isKids) === 'true';
          const hasKidsGenre = m.genres?.some(g => {
            const genreLower = String(g).toLowerCase();
            return genreLower.includes('animasyon') || genreLower.includes('çizgi') || genreLower.includes('çocuk') || genreLower.includes('aile') || genreLower.includes('kids');
          });
          return isKidsTagged || hasKidsGenre;
        }) || [];
        return { ...pl, movies: kidsMovies };
      }).filter(pl => pl.movies.length > 0)
    : curatorPlaylists;

  // Gelişmiş Arama Filtreleri
  const filteredMovies = allowedMovies.filter(movie => {
    const matchesSearch = 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.cast && movie.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesGenre = selectedGenre === 'Tümü' || movie.genres.includes(selectedGenre);
    const matchesLanguage = selectedLanguageFilter === 'Tümü' || movie.language === selectedLanguageFilter;
    return matchesSearch && matchesGenre && matchesLanguage;
  });

  const isFiltering = searchQuery !== '' || selectedGenre !== 'Tümü' || selectedLanguageFilter !== 'Tümü';
  const heroMovie = allowedMovies.length > 0 ? allowedMovies[0] : null;

  // Netflix "İzlemeye Devam Et" listesi
  const continueWatchingList = activeProfile?.playbackHistory
    ?.map(hist => {
      const mId = hist.movie;
      const movie = allowedMovies.find(m => String(m._id || m.id) === String(mId));
      return movie ? { ...movie, progress: hist.progressSeconds, duration: hist.durationSeconds } : null;
    })
    .filter(Boolean) || [];

  // MUBI Günün Filmi Kürasyonu
  const movieOfTheDay = allowedMovies.find(m => m.imdbRating > 9.0) || allowedMovies[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070708] text-purple-400">
        <div className="w-8 h-8 border-t-2 border-purple-500 rounded-full animate-spin animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* ARAMA VE TÜRLER HEADER */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#111113]/40 p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative w-full lg:max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070708] text-sm text-gray-100 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 border border-white/5 transition-all placeholder-gray-500"
            />
          </div>
          
          {/* Mobil Globe Dil Seçici */}
          <div className="relative md:hidden flex items-center bg-[#070708] hover:bg-white/5 border border-white/5 rounded-xl p-3.5 text-purple-400 cursor-pointer">
            <Globe className="w-5 h-5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto scrollbar-hide py-1 items-center">
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedGenre === genre 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20 scale-105' 
                  : 'bg-[#111113] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              {getGenreLabel(genre)}
            </button>
          ))}

          {/* DİL SEÇİM AKORDİYON TETİKLEYİCİ */}
          <button
            onClick={() => setIsLangAccordionOpen(!isLangAccordionOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
              isLangAccordionOpen || selectedLanguageFilter !== 'Tümü'
                ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                : 'bg-[#111113] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('language_filter')}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangAccordionOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* AKORDİYON PANELİ */}
      <div className={`transition-all duration-300 overflow-hidden bg-[#111113]/25 rounded-2xl border border-white/5 shadow-md flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
        isLangAccordionOpen ? 'max-h-24 p-4 opacity-100 mb-6' : 'max-h-0 p-0 border-none opacity-0 scale-95 pointer-events-none'
      }`}>
        <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          {t('language_filter')}:
        </span>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
          {languageFilters.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setSelectedLanguageFilter(lang.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedLanguageFilter === lang.key 
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/50 shadow-inner' 
                  : 'bg-[#070708] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              {t(lang.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {isFiltering ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white border-l-4 border-purple-500 pl-3">
            {language === 'tr' ? 'Arama Sonuçları' : language === 'en' ? 'Search Results' : language === 'ru' ? 'Результаты поиска' : language === 'de' ? 'Suchergebnisse' : 'Résultats de recherche'} ({filteredMovies.length})
          </h2>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMovies.map(movie => (
                <MovieCard key={movie._id || movie.id} movie={movie} onClick={() => onMovieSelect(movie)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 border border-white/5 rounded-3xl bg-[#111113]/25 italic">{t('no_content_found')}</div>
          )}
        </div>
      ) : (
        <>
          {/* GÜNÜN SEÇİMİ */}
          {movieOfTheDay && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-r from-[#1b0c30]/80 via-[#111113]/90 to-[#070708] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />
              <div className="lg:col-span-2 space-y-4 z-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-purple-400 font-extrabold uppercase tracking-widest">
                  <Flame className="w-4 h-4 text-purple-400 animate-pulse" /> {t('curator_selections')}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-purple-400 transition-colors leading-none tracking-tight">
                  {movieOfTheDay.title}
                </h3>
                {movieOfTheDay.curatorReview && (
                  <p className="text-xs text-purple-300 italic bg-purple-950/10 border-l-2 border-purple-500/50 pl-4 py-1.5 max-w-xl">
                    "{movieOfTheDay.curatorReview}"
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-xl line-clamp-3">
                  {movieOfTheDay.description}
                </p>
                <button 
                  onClick={() => onMovieSelect(movieOfTheDay)} 
                  className="flex items-center gap-2 bg-white text-black hover:bg-purple-600 hover:text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider w-fit cursor-pointer transition-all duration-300 shadow-md"
                >
                  <Film className="w-4 h-4 fill-current" />
                  {t('examine_and_play')}
                </button>
              </div>
              <div className="aspect-video lg:aspect-auto lg:h-[240px] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                <img src={movieOfTheDay.thumbnail} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]" />
              </div>
            </div>
          )}

          {/* NETFLIX İZLEMEYE DEVAM ET */}
          {continueWatchingList.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">{t('continue_watching')}</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide py-1 scroll-smooth">
                {continueWatchingList.map((movie) => {
                  const percent = Math.min(100, Math.floor((movie.progress / movie.duration) * 100)) || 0;
                  return (
                    <div key={movie._id || movie.id} onClick={() => onMovieSelect(movie)} className="flex-shrink-0 w-[150px] md:w-[185px] cursor-pointer group">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-lg group-hover:border-purple-500/50 transition-all">
                        <img src={movie.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2.5 space-y-1">
                          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                            <span>{t('remaining')}: %{100 - percent}</span>
                            <span>%{percent}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-white font-bold text-xs truncate mt-2 group-hover:text-purple-400 transition-colors">{movie.title}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dev Hero Banner */}
          {heroMovie && (
            <Hero movie={heroMovie} onSelect={onMovieSelect} />
          )}

          {/* WEEKLY TOP 10 ŞERİDİ */}
          {allowedMovies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">{t('weekly_top10')}</h2>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth overflow-visible">
                {allowedMovies.filter(m => m.isTop10).slice(0, 10).map((movie, index) => (
                  <div 
                    key={movie._id || movie.id} 
                    className="flex-shrink-0 relative flex items-end justify-start cursor-pointer group w-[180px] h-[220px] md:h-[250px] select-none overflow-visible" 
                    onClick={() => onMovieSelect(movie)}
                  >
                    <span className="absolute left-[-10px] bottom-[-20px] hbo-number-badge font-black text-[9rem] md:text-[11rem] transition-all group-hover:scale-105 duration-300 select-none z-0 leading-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                      {index + 1}
                    </span>
                    <div className="relative z-10 ml-16 md:ml-20 w-[110px] md:w-[130px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 group-hover:border-purple-500 shadow-2xl group-hover:scale-105 transition-all duration-300">
                      <img src={movie.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KÜRATÖR SİNEMA ODALARI */}
          {allowedPlaylists.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                <h2 className="text-lg font-bold text-white">{t('curator_lists')}</h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                  {t('curator_badge')}
                </span>
              </div>
              
              <div className="flex gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth">
                {allowedPlaylists.map((pl) => (
                  <div 
                    key={pl._id || pl.id} 
                    onClick={() => setSelectedPlaylist(pl)}
                    className="flex-shrink-0 w-[280px] p-4 rounded-2xl border border-white/5 bg-[#111113]/55 hover:bg-[#111113]/90 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer shadow-lg flex flex-col justify-between space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-1 w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5 relative shadow-inner">
                      {pl.movies && pl.movies.length > 0 ? (
                        pl.movies.slice(0, 4).map((m, mIdx) => (
                          <img key={mIdx} src={m.thumbnail} alt="" className="w-full h-full object-cover" />
                        ))
                      ) : (
                        <div className="col-span-2 flex items-center justify-center text-xs text-gray-600 italic font-medium">
                          {language === 'tr' ? 'Liste henüz boş' : language === 'en' ? 'List is empty' : language === 'ru' ? 'Список пуст' : language === 'de' ? 'Liste ist leer' : 'Liste vide'}
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
                        {pl.movies?.length || 0} {language === 'tr' ? 'İÇERİK' : language === 'en' ? 'TITLES' : language === 'ru' ? 'ВИДЕО' : language === 'de' ? 'INHALTE' : 'VIDÉOS'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <img src={pl.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'} alt="" className="w-5 h-5 rounded-full object-cover border border-purple-500/40" />
                        <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest">{pl.creatorName || 'Kinoia Küratörü'}</span>
                      </div>
                      <h3 className="text-sm font-black text-gray-100 truncate group-hover:text-purple-400 transition-colors">{pl.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-medium">
                        {pl.description || (language === 'tr' ? 'Bu çalma listesi için açıklama girilmemiş.' : 'No description available for this playlist.')}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-purple-400 font-bold border-t border-white/5 pt-2.5">
                      <span className="flex items-center gap-1">{t('room_inspect')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAY MODALI */}
          {selectedPlaylist && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="max-w-4xl w-full max-h-[85vh] rounded-3xl border border-white/10 bg-[#111113]/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6 overflow-hidden">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={selectedPlaylist.creatorAvatar} alt="" className="w-6 h-6 rounded-full border border-purple-500" />
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                        {selectedPlaylist.creatorName} {language === 'tr' ? 'Odasındasın' : language === 'en' ? 'Room' : language === 'ru' ? 'Комната' : language === 'de' ? 'Raum' : 'Salle'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{selectedPlaylist.title}</h3>
                    <p className="text-xs text-gray-400">{selectedPlaylist.description}</p>
                  </div>
                  <button onClick={() => setSelectedPlaylist(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                  {selectedPlaylist.movies && selectedPlaylist.movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {selectedPlaylist.movies.map((movie) => (
                        <div key={movie._id || movie.id} onClick={() => { setSelectedPlaylist(null); onMovieSelect(movie); }}>
                          <MovieCard movie={movie} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-500 italic">
                      {language === 'tr' ? 'Bu odada henüz hiçbir film veya dizi yok.' : 'No movies or TV shows in this room yet.'}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button onClick={() => setSelectedPlaylist(null)} className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer">
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STANDART SLIDER KATEGORİSİ */}
          <div className="space-y-12">
            {allowedMovies.length > 0 && (
              <MovieSlider 
                title={t('new_added')} 
                movies={allowedMovies} 
                onMovieSelect={onMovieSelect} 
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}