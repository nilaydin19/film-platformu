import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Film, ShieldAlert, Play, Bookmark, ListPlus, FolderPlus, Check, X, Sparkles } from 'lucide-react';
import HybridPlayer from '../components/HybridPlayer';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { useLanguage } from '../context/LanguageContext';

export default function MovieDetail({ movie, onBack }) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Küratör Sensin (Çalma Listesi) Eyaletleri
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [playlistSuccessMsg, setPlaylistSuccessMsg] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchSimilarMovies();
    checkWatchlistStatus();
    if (user) {
      fetchPlaylists();
    }
    // Dizi ise ilk bölümü varsayılan olarak seç
    if (movie.type === 'series' && movie.seasons?.length > 0) {
      setActiveEpisode(movie.seasons[0].episodes[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movie, user]);

  // Dropdown dışına tıklandığında kapatmak için event listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlaylistDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkWatchlistStatus = () => {
    const activeProfile = user?.profiles.find(p => p._id === user.activeProfileId || p.id === user.activeProfileId);
    if (activeProfile) {
      const mId = movie._id || movie.id;
      setIsWatchlisted(activeProfile.watchlist.some(id => String(id) === String(mId)));
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/playlists', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (err) {
      console.error('Küratör listeleri yüklenemedi:', err);
    }
  };

  const fetchSimilarMovies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const allMovies = await response.json();
        const currentId = movie._id || movie.id;
        
        const activeProfile = user?.profiles.find(p => String(p._id || p.id) === String(user.activeProfileId));
        const isKidsActive = activeProfile?.isKids === true || activeProfile?.isKids === 1 || String(activeProfile?.isKids) === 'true';
        
        const allowedMoviesList = isKidsActive
          ? allMovies.filter(m => m.isKids === true || m.isKids === 1 || String(m.isKids) === 'true' || m.genres.includes('Animasyon') || m.genres.includes('Çizgi Film') || m.genres.includes('Çocuk'))
          : allMovies;

        const filtered = allowedMoviesList.filter(m => 
          (m._id !== currentId && m.id !== currentId) && 
          m.type === movie.type &&
          m.genres.some(g => movie.genres.includes(g))
        );
        setSimilarMovies(filtered.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWatchNow = () => {
    if (user?.subscriptionStatus !== 'active' && user?.role !== 'admin') {
      setErrorMessage(t('unauthorized_desc'));
      return;
    }
    setErrorMessage('');
    setIsPlaying(true);
  };

  const handleWatchEpisode = (ep) => {
    if (user?.subscriptionStatus !== 'active' && user?.role !== 'admin') {
      setErrorMessage(t('unauthorized_desc'));
      return;
    }
    setErrorMessage('');
    setActiveEpisode(ep);
    setIsPlaying(true);
  };

  const toggleWatchlist = async () => {
    try {
      const mId = movie._id || movie.id;
      const response = await fetch(`http://localhost:5000/api/movies/${mId}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setIsWatchlisted(!isWatchlisted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Listeye film ekle / çıkar
  const toggleMovieInPlaylist = async (playlistId, isInPlaylist) => {
    try {
      const token = localStorage.getItem('token');
      const mId = movie._id || movie.id;
      if (isInPlaylist) {
        // Kaldır
        const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/movies/${mId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchPlaylists();
          setPlaylistSuccessMsg(t('removed_from_room'));
          setTimeout(() => setPlaylistSuccessMsg(''), 2000);
        }
      } else {
        // Ekle
        const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/movies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ movieId: mId })
        });
        if (response.ok) {
          fetchPlaylists();
          setPlaylistSuccessMsg(t('added_to_room'));
          setTimeout(() => setPlaylistSuccessMsg(''), 2000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Yeni Küratör Listesi Oluştur ve Ekle
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const mId = movie._id || movie.id;
      
      const response = await fetch('http://localhost:5000/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newPlaylistTitle, description: newPlaylistDesc })
      });

      if (response.ok) {
        const newPL = await response.json();
        // Oluşturulan listeye hemen bu filmi ekle
        const addResponse = await fetch(`http://localhost:5000/api/playlists/${newPL.id || newPL._id}/movies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ movieId: mId })
        });

        if (addResponse.ok) {
          setNewPlaylistTitle('');
          setNewPlaylistDesc('');
          fetchPlaylists();
          setPlaylistSuccessMsg(t('created_and_added'));
          setTimeout(() => setPlaylistSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getGenreLabel = (genreKey) => {
    const genreMap = {
      'Romantik Komedi': language === 'tr' ? 'Romantik Komedi' : language === 'en' ? 'Romantic Comedy' : language === 'ru' ? 'Романтическая комедия' : language === 'de' ? 'Liebeskomödie' : 'Comédie Romantique',
      'Komedi': language === 'tr' ? 'Komedi' : language === 'en' ? 'Comedy' : language === 'ru' ? 'Комедия' : language === 'de' ? 'Komödie' : 'Comédie',
      'Romantik': language === 'tr' ? 'Romantik' : language === 'en' ? 'Romance' : language === 'ru' ? 'Мелодрама' : language === 'de' ? 'Romantik' : 'Romance',
      'Dram': language === 'tr' ? 'Dram' : language === 'en' ? 'Drama' : language === 'ru' ? 'Драма' : language === 'de' ? 'Drama' : 'Drame',
      'Korku': language === 'tr' ? 'Korku' : language === 'en' ? 'Horror' : language === 'ru' ? 'Ужасы' : language === 'de' ? 'Horror' : 'Horreur',
      'Bilim Kurgu': language === 'tr' ? 'Bilim Kurgu' : language === 'en' ? 'Sci-Fi' : language === 'ru' ? 'Фантастика' : language === 'de' ? 'Sci-Fi' : 'Science-Fiction',
      'Gerilim': language === 'tr' ? 'Gerilim' : language === 'en' ? 'Thriller' : language === 'ru' ? 'Триллер' : language === 'de' ? 'Thriller' : 'Thriller',
      'Aksiyon': language === 'tr' ? 'Aksiyon' : language === 'en' ? 'Action' : language === 'ru' ? 'Экшен' : language === 'de' ? 'Action' : 'Action',
      'Macera': language === 'tr' ? 'Macera' : language === 'en' ? 'Adventure' : language === 'ru' ? 'Приключения' : language === 'de' ? 'Abenteuer' : 'Aventure',
      'Tarih': language === 'tr' ? 'Tarih' : language === 'en' ? 'History' : language === 'ru' ? 'История' : language === 'de' ? 'Geschichte' : 'Histoire',
      'Biyografi': language === 'tr' ? 'Biyografi' : language === 'en' ? 'Biography' : language === 'ru' ? 'Биография' : language === 'de' ? 'Biografie' : 'Biographie',
      'Suç': language === 'tr' ? 'Suç' : language === 'en' ? 'Crime' : language === 'ru' ? 'Криминал' : language === 'de' ? 'Krimi' : 'Crime',
      'Gizem': language === 'tr' ? 'Gizem' : language === 'en' ? 'Mystery' : language === 'ru' ? 'Детектив' : language === 'de' ? 'Mystery' : 'Mystère',
      'Animasyon': language === 'tr' ? 'Animasyon' : language === 'en' ? 'Animation' : language === 'ru' ? 'Анимация' : language === 'de' ? 'Animation' : 'Animation',
      'Savaş': language === 'tr' ? 'Savaş' : language === 'en' ? 'War' : language === 'ru' ? 'Военный' : language === 'de' ? 'Kriegsfilm' : 'Guerre',
      'Fantastik': language === 'tr' ? 'Fantastik' : language === 'en' ? 'Fantasy' : language === 'ru' ? 'Фэнтези' : language === 'de' ? 'Fantasy' : 'Fantastique'
    };
    return genreMap[genreKey] || genreKey;
  };

  // Sezon Seçim Filtresi
  const activeSeason = movie.seasons?.find(s => s.seasonNumber === selectedSeason);

  return (
    <div className="relative min-h-screen text-gray-100 pb-20 animate-fade-in">
      {/* Netflix-style Cinematic Background Trailer Loop */}
      {!isPlaying && (
        <div className="absolute top-0 left-0 right-0 w-full h-[55vh] md:h-[65vh] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070708]/50 to-[#070708] z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/85 via-[#070708]/20 to-transparent z-10 hidden md:block" />
          {movie.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.youtubeId}&playsinline=1&enablejsapi=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`}
              title="Background Trailer"
              className="w-full h-[140%] -translate-y-[15%] aspect-video border-0 opacity-35 object-cover scale-110 md:scale-125 transition-opacity duration-1000"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center opacity-10 filter blur-xl"
              style={{ backgroundImage: `url('${movie.thumbnail}')` }}
            />
          )}
        </div>
      )}

      <div 
        className="absolute inset-0 bg-cover bg-top filter blur-3xl opacity-10 pointer-events-none z-0"
        style={{ backgroundImage: `url('${movie.thumbnail}')` }}
      />

      <button 
        onClick={() => onBack()}
        className="fixed top-6 left-6 md:left-72 bg-[#111113]/80 backdrop-blur border border-white/5 p-3 rounded-2xl hover:bg-white/10 transition-all z-50 flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('back_btn')}</span>
      </button>

      <div className="max-w-5xl mx-auto pt-24 px-4 relative z-10 space-y-16">
        
        {/* HİBRİT OYNATICI ALANI */}
        {isPlaying ? (
          <div className="w-full">
            <HybridPlayer 
              movie={movie.type === 'series' ? activeEpisode : movie} 
              onBack={() => setIsPlaying(false)}
            />
            <div className="mt-4 flex justify-between items-center bg-[#111113] p-4 rounded-2xl border border-white/5 shadow-xl">
              <span className="font-bold text-sm text-purple-400">
                {movie.type === 'series' 
                  ? `${t('now_playing')}: ${activeEpisode?.title}` 
                  : `${t('now_playing')}: ${movie.title}`}
              </span>
              <button 
                onClick={() => setIsPlaying(false)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-red-500/30"
              >
                {t('close_player')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            
            {/* Sol Poster */}
            <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group/poster">
              <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover transform group-hover/poster:scale-105 transition-transform duration-[1.5s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-xs text-gray-300 font-medium">IMDb: {movie.imdbRating}</span>
              </div>
            </div>

            {/* Sağ Detaylar */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs bg-purple-600/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold">
                    {movie.type === 'series' ? t('series') : t('movies')} • {movie.origin === 'turkish' ? (language === 'tr' ? 'Türk Yapımı' : 'Turkish Production') : 'Hollywood'}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-3 leading-none">{movie.title}</h1>
                </div>

                {/* Eylem Butonları */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* Küratör Listeme Ekle */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                        showPlaylistDropdown 
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'bg-[#111113] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                      }`}
                      title={t('add_to_curator_room')}
                    >
                      <ListPlus className="w-5 h-5" />
                    </button>

                    {/* Popover Penceresi */}
                    {showPlaylistDropdown && (
                      <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#111113]/95 backdrop-blur-xl p-5 shadow-2xl z-30 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                          <span className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> {t('curator_rooms_title')}
                          </span>
                          <button onClick={() => setShowPlaylistDropdown(false)}>
                            <X className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                          </button>
                        </div>

                        {playlistSuccessMsg && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold p-2 rounded-xl text-center">
                            {playlistSuccessMsg}
                          </div>
                        )}

                        {/* Listeler Seçim Alanı */}
                        <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-2">
                          {playlists.length === 0 ? (
                            <p className="text-xs text-gray-500 italic py-2 text-center">{t('no_room_created')}</p>
                          ) : (
                            playlists.map((pl) => {
                              const movieID = movie._id || movie.id;
                              const isAdded = pl.movies?.some(m => String(m.id || m._id) === String(movieID));
                              return (
                                <div 
                                  key={pl.id} 
                                  onClick={() => toggleMovieInPlaylist(pl.id, isAdded)}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all"
                                >
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-gray-200">{pl.title}</h4>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{pl.description || (language === 'tr' ? 'Açıklama yok.' : 'No description.')}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    isAdded ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20'
                                  }`}>
                                    {isAdded && <Check className="w-3.5 h-3.5 font-bold" />}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Yeni Çalma Listesi Oluştur Formu */}
                        <form onSubmit={handleCreatePlaylist} className="border-t border-white/5 pt-3 space-y-2">
                          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5 mb-2">
                            <FolderPlus className="w-3.5 h-3.5" /> {t('new_room_form')}
                          </span>
                          <input 
                            type="text" 
                            placeholder={t('room_title_placeholder')}
                            value={newPlaylistTitle}
                            onChange={e => setNewPlaylistTitle(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          />
                          <input 
                            type="text" 
                            placeholder={t('room_desc_placeholder')}
                            value={newPlaylistDesc}
                            onChange={e => setNewPlaylistDesc(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          />
                          <button 
                            type="submit" 
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {t('create_and_add')}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Standart İzleme Listesi Butonu */}
                  <button 
                    onClick={toggleWatchlist}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isWatchlisted 
                        ? 'bg-purple-600/10 text-purple-400 border-purple-500/30' 
                        : 'bg-[#111113] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                    }`}
                    title={t('add_to_watchlist')}
                  >
                    <Bookmark className={`w-5 h-5 ${isWatchlisted ? 'fill-purple-400' : ''}`} />
                  </button>

                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg font-bold">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.imdbRating} IMDb</span>
                </div>
                <span>{movie.releaseYear}</span>
                <span>{movie.type === 'series' ? `${movie.seasons?.length} ${t('seasons')}` : movie.duration}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g, idx) => (
                  <span key={idx} className="bg-[#111113] border border-white/5 text-gray-300 px-3 py-1 rounded-xl text-xs font-semibold">
                    {getGenreLabel(g)}
                  </span>
                ))}
              </div>

              <div className="border-t border-white/5 pt-6 space-y-4">
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">{movie.description}</p>
                {movie.curatorReview && (
                  <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl text-xs italic text-purple-300 shadow-lg">
                    <span className="font-bold block mb-1 uppercase tracking-widest text-[9px] text-purple-400">{t('curator_review')}:</span>
                    "{movie.curatorReview}"
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#111113]/50 p-4 rounded-2xl border border-white/5 text-gray-400 shadow-md">
                  <p><span className="font-bold text-gray-200">{t('director_label')}:</span> {movie.director || (language === 'tr' ? 'Bilinmiyor' : 'Unknown')}</p>
                  <p><span className="font-bold text-gray-200">{t('actors_label')}:</span> {movie.cast ? movie.cast.join(', ') : (language === 'tr' ? 'Bilinmiyor' : 'Unknown')}</p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Filmler İçin Doğrudan Oynat Butonu */}
              {movie.type === 'movie' && (
                <button 
                  onClick={handleWatchNow}
                  className="flex items-center gap-2.5 bg-white text-black hover:bg-purple-600 hover:text-white hover:scale-105 active:scale-95 font-black px-8 py-4 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-widest cursor-pointer"
                >
                  <Film className="w-5 h-5 fill-current" />
                  {t('watch_now')}
                </button>
              )}
            </div>

          </div>
        )}

        {/* DIZILER IÇIN BÖLÜM SEÇİCİ */}
        {!isPlaying && movie.type === 'series' && movie.seasons?.length > 0 && (
          <div className="border-t border-white/5 pt-10 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white border-l-4 border-purple-500 pl-3">{t('episodes')}</h2>
              
              <select 
                value={selectedSeason} 
                onChange={e => setSelectedSeason(Number(e.target.value))}
                className="bg-[#111113] text-gray-300 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                {movie.seasons.map(s => (
                  <option key={s.seasonNumber} value={s.seasonNumber}>{s.seasonNumber}. {t('seasons')}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSeason?.episodes.map((ep, idx) => (
                <div 
                  key={ep._id || ep.id || idx} 
                  onClick={() => handleWatchEpisode(ep)}
                  className="bg-[#111113] hover:bg-[#1b1b1f] border border-white/5 hover:border-purple-500/30 p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all group shadow-md"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-400 font-bold uppercase">{language === 'tr' ? 'Bölüm' : 'Episode'} {idx + 1}</span>
                    <h4 className="text-sm font-bold text-gray-100 group-hover:text-purple-400 transition-colors">{ep.title}</h4>
                    <p className="text-[10px] text-gray-500">{ep.duration}</p>
                  </div>
                  <Play className="w-5 h-5 text-gray-500 group-hover:text-purple-500 group-hover:scale-110 transition-all fill-transparent group-hover:fill-purple-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BENZER İÇERİK ÖNERİLERİ */}
        {!isPlaying && similarMovies.length > 0 && (
          <div className="border-t border-white/5 pt-10 space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white border-l-4 border-purple-500 pl-3">
              {t('similar_recommendations')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {similarMovies.map((simMovie) => (
                <MovieCard 
                  key={simMovie._id || simMovie.id}
                  movie={simMovie}
                  onClick={() => {
                    onBack(simMovie);
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
