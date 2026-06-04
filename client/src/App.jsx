import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSelector from './components/ProfileSelector';
import MovieSlider from './components/MovieSlider';
import { MovieCard } from './components/MovieCard';
import { Menu, Globe, ChevronUp } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [profileSelected, setProfileSelected] = useState(false);
  const [allContent, setAllContent] = useState([]);
  
  // Köşedeki Dil Akordiyon Eyaleti
  const [isFloatingLangOpen, setIsFloatingLangOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user, activeTab]);

  const fetchContent = async () => {
    try {
      // 🔥 DOĞRU CANLI BACKEND ADRESİNE BAĞLANDIK (onrender.com) 🔥
      const response = await fetch('https://film-platformu.onrender.com/api/movies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllContent(data);
      }
    } catch (err) {
      console.error('İçerikler çekilemedi:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070708]">
        <div className="w-8 h-8 border-t-2 border-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Auth />;

  if (!profileSelected) {
    return <ProfileSelector onProfileSelected={() => setProfileSelected(true)} />;
  }

  const handleSelectMovie = (movie) => {
    setSelectedMovie(null);
    setTimeout(() => {
      setSelectedMovie(movie);
    }, 50);
  };

 // 🔥 PROFIL BULMA VE ÇOCUK FİLTRESİNİ KESİNLEŞTİREN GÜVENLİ BLOK 🔥
  const activeProfile = user?.profiles?.find(p => 
    String(p._id || p.id) === String(user?.activeProfileId)
  ) || user?.profiles?.[0]; // Eğer ID eşleşmezse ilk profili baz alarak çökmesini engelliyoruz

  const isKidsActive = activeProfile?.isKids === true || 
                       activeProfile?.isKids === 1 || 
                       String(activeProfile?.isKids) === 'true' || 
                       String(activeProfile?.name).toLowerCase().includes('çocuk') || 
                       String(activeProfile?.name).toLowerCase().includes('kids');
  
  // Çocuk Profili İçerik Süzgeci
  const allowedContent = isKidsActive
    ? allContent.filter(m => m.isKids === true || m.isKids === 1 || String(m.isKids) === 'true' || m.genres.includes('Animasyon') || m.genres.includes('Çizgi Film') || m.genres.includes('Çocuk'))
    : allContent;

  const watchlistContent = allowedContent.filter(m => activeProfile?.watchlist.some(id => String(id) === String(m._id || m.id)));

  // Filmler ve Diziler sekmeleri için içerik ayrımı
  const moviesOnly = allowedContent.filter(m => m.type === 'movie');
  const seriesOnly = allowedContent.filter(m => m.type === 'series');

  const getLocalizedLabel = (key) => {
    const labels = {
      moviesDesc: {
        tr: 'Özenle seçilmiş, ödüllü Hollywood yapımları ve yerli Türk sinema filmleri.',
        en: 'Carefully selected, award-winning Hollywood and domestic Turkish movies.',
        ru: 'Тщательно отобранные награжденные голливудские и турецкие фильмы.',
        de: 'Sorgfältig ausgewählte, preisgekrönte Hollywood- und türkische Filme.',
        fr: 'Films hollywoodiens et turcs primés et sélectionnés avec soin.'
      },
      seriesDesc: {
        tr: 'Sürükleyici hikayeler, yerli ve yabancı en iyi dizi serüvenleri.',
        en: 'Immersive stories, the best domestic and foreign TV series adventures.',
        ru: 'Захватывающие истории, лучшие отечественные и зарубежные сериалы.',
        de: 'Fesselnde Geschichten, die besten nationalen und internationalen Serien.',
        fr: 'Des histoires captivantes, les meilleures aventures de séries nationales et étrangères.'
      },
      watchlistDesc: {
        tr: 'profilinin kaydettiği tüm film ve diziler.',
        en: 'all movies and TV shows saved by this profile.',
        ru: 'все сохраненные фильмы и сериалы в этом профиле.',
        de: 'alle für dieses Profil gespeicherten Filme und Serien.',
        fr: 'tous les films et séries enregistrés par ce profil.'
      },
      featuredMovies: {
        tr: 'Öne Çıkan Sinema Filmleri',
        en: 'Featured Cinema Movies',
        ru: 'Рекомендуемые кинофильмы',
        de: 'Ausgewählte Kinofilme',
        fr: 'Films de cinéma vedettes'
      },
      turkishCinema: {
        tr: 'Türk Sineması',
        en: 'Turkish Cinema',
        ru: 'Турецкое кино',
        de: 'Türkisches Kino',
        fr: 'Cinéma Turc'
      },
      hollywoodCinema: {
        tr: 'Hollywood Sineması',
        en: 'Hollywood Cinema',
        ru: 'Голливудское кино',
        de: 'Hollywood Kino',
        fr: 'Cinéma Hollywoodien'
      },
      popularSeries: {
        tr: 'Popüler Diziler',
        en: 'Popular TV Shows',
        ru: 'Популярные сериалы',
        de: 'Beliebte Serien',
        fr: 'Séries Populaires'
      },
      turkishSeries: {
        tr: 'Yerli Yapım Diziler',
        en: 'Domestic TV Shows',
        ru: 'Отечественные сериалы',
        de: 'Nationale Serien',
        fr: 'Séries Nationales'
      },
      foreignSeries: {
        tr: 'Yabancı Diziler',
        en: 'Foreign TV Shows',
        ru: 'Зарубежные сериалы',
        de: 'Ausländische Serien',
        fr: 'Séries Étrangères'
      }
    };
    return labels[key]?.[language] || labels[key]?.['tr'];
  };

  return (
    <div className="min-h-screen bg-[#070708] text-gray-100 font-sans relative">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedMovie(null);
        if (tab === 'profile') setProfileSelected(false);
      }} />

      <main className="md:pl-72 p-6 md:p-8 min-h-screen">
        {selectedMovie ? (
          <MovieDetail 
            movie={selectedMovie} 
            onBack={(nextMovie) => {
              if (nextMovie && nextMovie._id) {
                handleSelectMovie(nextMovie);
              } else {
                setSelectedMovie(null);
                fetchContent();
              }
            }} 
          />
        ) : (
          <>
            {activeTab === 'home' && <Home onMovieSelect={handleSelectMovie} />}

            {activeTab === 'movies' && (
              <div className="space-y-8 pb-20 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-black text-white">{t('movies')}</h1>
                  <p className="text-gray-400 text-sm mt-1">{getLocalizedLabel('moviesDesc')}</p>
                </div>
                {moviesOnly.length > 0 ? (
                  <div className="space-y-10">
                    {isKidsActive ? (
                      <>
                        <MovieSlider title={language === 'tr' ? 'Kinoia Popüler Çocuk Filmleri' : 'Kinoia Popular Kids Movies'} movies={moviesOnly} onMovieSelect={handleSelectMovie} />
                        {moviesOnly.filter(m => m.genres.includes('Aile')).length > 0 && (
                          <MovieSlider title={language === 'tr' ? 'Aile ve Eğlence' : 'Family & Fun'} movies={moviesOnly.filter(m => m.genres.includes('Aile'))} onMovieSelect={handleSelectMovie} />
                        )}
                        {moviesOnly.filter(m => m.genres.includes('Aksiyon')).length > 0 && (
                          <MovieSlider title={language === 'tr' ? 'Kahramanlık ve Macera' : 'Heroic Adventures'} movies={moviesOnly.filter(m => m.genres.includes('Aksiyon'))} onMovieSelect={handleSelectMovie} />
                        )}
                      </>
                    ) : (
                      <>
                        <MovieSlider title={getLocalizedLabel('featuredMovies')} movies={moviesOnly} onMovieSelect={handleSelectMovie} />
                        {moviesOnly.filter(m => m.origin === 'turkish').length > 0 && (
                          <MovieSlider title={getLocalizedLabel('turkishCinema')} movies={moviesOnly.filter(m => m.origin === 'turkish')} onMovieSelect={handleSelectMovie} />
                        )}
                        {moviesOnly.filter(m => m.origin === 'hollywood').length > 0 && (
                          <MovieSlider title={getLocalizedLabel('hollywoodCinema')} movies={moviesOnly.filter(m => m.origin === 'hollywood')} onMovieSelect={handleSelectMovie} />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">{t('no_movies_added')}</div>
                )}
              </div>
            )}

            {activeTab === 'series' && (
              <div className="space-y-8 pb-20 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-black text-white">{t('series')}</h1>
                  <p className="text-gray-400 text-sm mt-1">{getLocalizedLabel('seriesDesc')}</p>
                </div>
                {seriesOnly.length > 0 ? (
                  <div className="space-y-10">
                    {isKidsActive ? (
                      <>
                        <MovieSlider title={language === 'tr' ? 'Eğlenceli Çocuk Dizileri' : 'Fun Kids TV Shows'} movies={seriesOnly} onMovieSelect={handleSelectMovie} />
                        {seriesOnly.filter(m => m.origin === 'turkish').length > 0 && (
                          <MovieSlider title={language === 'tr' ? 'Yerli Animasyon Dizileri' : 'Domestic Animated Shows'} movies={seriesOnly.filter(m => m.origin === 'turkish')} onMovieSelect={handleSelectMovie} />
                        )}
                      </>
                    ) : (
                      <>
                        <MovieSlider title={getLocalizedLabel('popularSeries')} movies={seriesOnly} onMovieSelect={handleSelectMovie} />
                        {seriesOnly.filter(m => m.origin === 'turkish').length > 0 && (
                          <MovieSlider title={getLocalizedLabel('turkishSeries')} movies={seriesOnly.filter(m => m.origin === 'turkish')} onMovieSelect={handleSelectMovie} />
                        )}
                        {seriesOnly.filter(m => m.origin === 'hollywood').length > 0 && (
                          <MovieSlider title={getLocalizedLabel('foreignSeries')} movies={seriesOnly.filter(m => m.origin === 'hollywood')} onMovieSelect={handleSelectMovie} />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">{t('no_series_added')}</div>
                )}
              </div>
            )}

            {activeTab === 'mylist' && (
              <div className="space-y-8 pb-20 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-black text-white">{t('curator_rooms')}</h1>
                  <p className="text-gray-400 text-sm mt-1">"{activeProfile?.name || 'Ana Profil'}" {getLocalizedLabel('watchlistDesc')}</p>
                </div>
                {watchlistContent.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchlistContent.map(movie => (
                      <MovieCard key={movie._id} movie={movie} onClick={() => handleSelectMovie(movie)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 text-sm bg-[#111113]/20 border border-white/5 rounded-3xl p-6 italic">
                    {t('empty_watchlist')}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin' && user?.role === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* KÖŞEDEKİ HIZLI AKORDİYON DİL SEÇİM PENCERESİ */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-50 flex flex-col items-end">
        <div className={`transition-all duration-300 overflow-hidden bg-[#111113]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mb-2 flex flex-col w-32 ${
          isFloatingLangOpen ? 'max-h-32 opacity-100 p-2 scale-100' : 'max-h-0 opacity-0 p-0 scale-95 pointer-events-none'
        }`}>
          <button 
            onClick={() => { setLanguage('tr'); setIsFloatingLangOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              language === 'tr' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>🇹🇷 TR</span>
            {language === 'tr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
          <button 
            onClick={() => { setLanguage('en'); setIsFloatingLangOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-between cursor-pointer ${
              language === 'en' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>🇺🇸 EN</span>
            {language === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
        </div>

        <button
          onClick={() => setIsFloatingLangOpen(!isFloatingLangOpen)}
          className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center ${
            isFloatingLangOpen 
              ? 'bg-purple-600 border-purple-500 text-white scale-110 rotate-90 shadow-purple-600/30' 
              : 'bg-[#111113]/85 backdrop-blur border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-purple-500/25'
          }`}
          title="Çeviri Seçenekleri / Translation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}