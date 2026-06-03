import React, { useState, useEffect } from 'react';
import { Film, Users, CreditCard, Shield, Plus, Trash2, Edit2, X, AlertTriangle, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalMovies: 0, totalUsers: 0, activeSubs: 0 });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Sorunlar ve Şikayetler State'leri
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' veya 'issues'
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Form Verileri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [imdbRating, setImdbRating] = useState(7.5);
  const [releaseYear, setReleaseYear] = useState(2024);
  const [genres, setGenres] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [origin, setOrigin] = useState('hollywood');
  const [type, setType] = useState('movie');
  const [isTop10, setIsTop10] = useState(false);
  const [isWeeklyRecommended, setIsWeeklyRecommended] = useState(false);
  const [isKids, setIsKids] = useState(false);
  const [ageRating, setAgeRating] = useState('Genel İzleyici');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [duration, setDuration] = useState('2s 15dk');
  const [curatorReview, setCuratorReview] = useState('');

  // Diziler İçin Hızlı Statik Bölüm Ekleme Seçeneği
  const [epTitle, setEpTitle] = useState('Bölüm 1: Giriş');
  const [epYoutubeId, setEpYoutubeId] = useState('QN39B6F3v4w');
  const [epVideoUrl, setEpVideoUrl] = useState('');

  useEffect(() => {
    fetchStats();
    fetchMovies();
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setIssuesLoading(true);
      const response = await fetch('http://localhost:5000/api/issues', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleToggleIssueStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (movie) => {
    setEditId(movie._id || movie.id);
    setTitle(movie.title);
    setDescription(movie.description);
    setThumbnail(movie.thumbnail);
    setImdbRating(movie.imdbRating);
    setReleaseYear(movie.releaseYear);
    setGenres(movie.genres.join(', '));
    setVideoUrl(movie.videoUrl || '');
    setYoutubeId(movie.youtubeId || '');
    setOrigin(movie.origin);
    setType(movie.type || 'movie');
    setIsTop10(movie.isTop10 || false);
    setIsWeeklyRecommended(movie.isWeeklyRecommended || false);
    setIsKids(movie.isKids || false);
    setAgeRating(movie.ageRating || 'Genel İzleyici');
    setDirector(movie.director || '');
    setCast(movie.cast ? movie.cast.join(', ') : '');
    setDuration(movie.duration || '2s 15dk');
    setCuratorReview(movie.curatorReview || '');
    
    if (movie.type === 'series' && movie.seasons?.length > 0 && movie.seasons[0].episodes?.length > 0) {
      setEpTitle(movie.seasons[0].episodes[0].title);
      setEpYoutubeId(movie.seasons[0].episodes[0].youtubeId || '');
      setEpVideoUrl(movie.seasons[0].episodes[0].videoUrl || '');
    }
    
    setShowForm(true);
  };

  const handleResetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setThumbnail('');
    setImdbRating(7.5);
    setReleaseYear(2024);
    setGenres('');
    setVideoUrl('');
    setYoutubeId('');
    setOrigin('hollywood');
    setType('movie');
    setIsTop10(false);
    setIsWeeklyRecommended(false);
    setIsKids(false);
    setAgeRating('Genel İzleyici');
    setDirector('');
    setCast('');
    setDuration('2s 15dk');
    setCuratorReview('');
    setEpTitle('Bölüm 1: Giriş');
    setEpYoutubeId('QN39B6F3v4w');
    setEpVideoUrl('');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const seasonsData = type === 'series' ? [
      {
        seasonNumber: 1,
        episodes: [
          { title: epTitle, youtubeId: epYoutubeId, videoUrl: epVideoUrl, duration: '45dk' }
        ]
      }
    ] : [];

    const movieData = {
      title,
      description,
      thumbnail,
      imdbRating: Number(imdbRating),
      releaseYear: Number(releaseYear),
      genres: genres.split(',').map(g => g.trim()),
      videoUrl,
      youtubeId,
      origin,
      type,
      isTop10,
      isWeeklyRecommended,
      isKids,
      ageRating,
      director,
      cast: cast.split(',').map(c => c.trim()),
      duration,
      curatorReview,
      seasons: seasonsData
    };

    const targetMovieId = editId;
    const url = targetMovieId ? `http://localhost:5000/api/movies/${targetMovieId}` : 'http://localhost:5000/api/movies';
    const method = targetMovieId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(movieData)
      });

      if (response.ok) {
        handleResetForm();
        fetchMovies();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu içeriği kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchMovies();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingIssuesCount = issues.filter(issue => issue.status === 'pending').length;

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Yönetici Paneli</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem istatistikleri ve içerik yönetim konsolu.</p>
        </div>
        {activeTab === 'movies' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-3 rounded-2xl text-xs uppercase cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Yeni İçerik Ekle
          </button>
        )}
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111113] p-6 rounded-3xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-gray-500">Kinoia Toplam İçerik</p>
            <p className="text-3xl font-bold text-gray-100 mt-2">{stats.totalMovies}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20"><Film className="w-6 h-6 text-purple-400" /></div>
        </div>

        <div className="bg-[#111113] p-6 rounded-3xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-gray-500">Kayıtlı Hesaplar</p>
            <p className="text-3xl font-bold text-gray-100 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20"><Users className="w-6 h-6 text-blue-400" /></div>
        </div>

        <div className="bg-[#111113] p-6 rounded-3xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-gray-500">Aktif Aboneler</p>
            <p className="text-3xl font-bold text-gray-100 mt-2">{stats.activeSubs}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20"><CreditCard className="w-6 h-6 text-green-400" /></div>
        </div>

        <div 
          onClick={() => setActiveTab('issues')}
          className="bg-[#111113] p-6 rounded-3xl border border-white/5 flex items-center justify-between shadow-lg cursor-pointer hover:border-amber-500/30 hover:bg-white/[0.02] transition-all"
        >
          <div>
            <p className="text-xs text-gray-500">Bekleyen Şikayetler</p>
            <p className="text-3xl font-bold text-amber-500 mt-2">{pendingIssuesCount}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${pendingIssuesCount > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' : 'bg-gray-500/10 border-white/5 text-gray-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEKME SEÇİCİ (TAB MENU) */}
      <div className="flex gap-6 border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab('movies')}
          className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'movies' ? 'text-purple-400 font-black' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <span className="flex items-center gap-2">
            <Film className="w-4 h-4" /> İçerik Kütüphanesi
          </span>
          {activeTab === 'movies' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_-2px_10px_rgba(168,85,247,0.5)]"></div>}
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'issues' ? 'text-purple-400 font-black' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Sorunlar & Şikayetler
            {pendingIssuesCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {pendingIssuesCount}
              </span>
            )}
          </span>
          {activeTab === 'issues' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_-2px_10px_rgba(168,85,247,0.5)]"></div>}
        </button>
      </div>

      {/* İÇERİK LİSTESİ TAB */}
      {activeTab === 'movies' && (
        <div className="bg-[#111113] rounded-3xl border border-white/5 overflow-hidden shadow-xl animate-fade-in">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-gray-200">Kütüphanedeki İçerikler</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {movies.map(movie => (
                <div key={movie._id || movie.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-white/[0.01] transition-all">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={movie.thumbnail} alt="" className="w-12 aspect-[2/3] object-cover rounded-lg border border-white/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-100">{movie.title}</h4>
                        <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded font-bold uppercase">{movie.type === 'series' ? 'Dizi' : 'Film'}</span>
                        {movie.isKids && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold uppercase">Çocuk</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{movie.releaseYear} • {movie.genres.join(', ')} • Sınır: {movie.ageRating || 'Genel'} • IMDb: {movie.imdbRating}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleOpenEdit(movie)}
                      className="p-2.5 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(movie._id || movie.id)}
                      className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SORUNLAR VE ŞİKAYETLER TAB */}
      {activeTab === 'issues' && (
        <div className="bg-[#111113] rounded-3xl border border-white/5 overflow-hidden shadow-xl animate-fade-in">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-200">Kullanıcı Bildirimleri & Hata Raporları</h2>
              <p className="text-xs text-gray-500 mt-1">Kullanıcıların oynatıcı (player) veya sistem genelinde bildirdiği sorunlar.</p>
            </div>
            <button 
              onClick={fetchIssues} 
              className="px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Yenile
            </button>
          </div>

          {issuesLoading ? (
            <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
          ) : issues.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Harika! Bildirilen Herhangi Bir Sorun Yok.</p>
              <p className="text-gray-600 text-xs mt-1">Kullanıcılar oynatıcı sorun bildirme formunu doldurduklarında burada listelenecektir.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {issues.map(issue => (
                <div key={issue.id} className={`p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:bg-white/[0.01] ${issue.status === 'resolved' ? 'opacity-60' : ''}`}>
                  
                  {/* SOL TARAF: İÇERİK VE KULLANICI BİLGİLERİ */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${
                        issue.status === 'resolved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse'
                      }`}>
                        {issue.status === 'resolved' ? 'Çözüldü' : 'Bekliyor'}
                      </span>
                      
                      {issue.movieTitle && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold">
                          Film: {issue.movieTitle}
                        </span>
                      )}
                      
                      <span className="text-[10px] bg-white/5 text-gray-400 border border-white/5 px-2.5 py-1 rounded-full">
                        Profil: {issue.profileName}
                      </span>

                      <span className="text-[10px] text-gray-500 ml-auto md:ml-0">
                        {new Date(issue.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Hata Açıklaması */}
                    <p className="text-sm text-gray-200 font-medium leading-relaxed bg-[#070708] p-4 rounded-2xl border border-white/5">
                      {issue.description}
                    </p>

                    {/* Kullanıcı E-posta */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="font-bold text-gray-400">Bildiren:</span> {issue.userEmail}
                    </div>
                  </div>

                  {/* SAĞ TARAF: AKSİYONLAR */}
                  <div className="flex md:flex-col items-center justify-end gap-2 md:self-center">
                    <button 
                      type="button"
                      onClick={() => handleToggleIssueStatus(issue.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer w-full justify-center md:w-36 ${
                        issue.status === 'resolved' 
                          ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500'
                      }`}
                    >
                      {issue.status === 'resolved' ? (
                        <>Yeniden Aç</>
                      ) : (
                        <>Çözüldü İşaretle</>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteIssue(issue.id)}
                      className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white"
                      title="Şikayeti Sil"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL PANEL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#111113] border border-white/10 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6">
            <button onClick={handleResetForm} className="absolute top-6 right-6 text-gray-500 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">BAŞLIK</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">AFİŞ RESMİ URL</label>
                  <input type="text" required value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-1">AÇIKLAMA</label>
                <textarea required rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">IMDB PUANI</label>
                  <input type="number" step="0.1" required value={imdbRating} onChange={e => setImdbRating(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">YAYIN YILI</label>
                  <input type="number" required value={releaseYear} onChange={e => setReleaseYear(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">İÇERİK TİPİ</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                    <option value="movie">Sinema Filmi</option>
                    <option value="series">Dizi</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">YAŞ SINIRI</label>
                  <select value={ageRating} onChange={e => setAgeRating(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                    <option value="Genel İzleyici">Genel İzleyici</option>
                    <option value="7+">7+</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">SÜRE (Filmler)</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
              </div>

              {/* DİZİ BÖLÜM EKLEME ALANLARI */}
              {type === 'series' && (
                <div className="p-4 bg-purple-900/5 border border-purple-500/20 rounded-2xl space-y-4">
                  <span className="text-[10px] text-purple-400 font-extrabold uppercase block tracking-wider">Hızlı Dizi Bölüm Ayarı (1. Sezon 1. Bölüm)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">BÖLÜM BAŞLIĞI</label>
                      <input type="text" value={epTitle} onChange={e => setEpTitle(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">YOUTUBE BÖLÜM ID</label>
                      <input type="text" value={epYoutubeId} onChange={e => setEpYoutubeId(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">MANUEL BÖLÜM VIDEO URL</label>
                      <input type="text" value={epVideoUrl} onChange={e => setEpVideoUrl(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">TÜRLER (Virgülle ayırın)</label>
                  <input type="text" required placeholder="Romantik Komedi, Dram, Korku, Animasyon" value={genres} onChange={e => setGenres(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">KÖKEN KATEGORİSİ</label>
                  <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                    <option value="hollywood">Hollywood</option>
                    <option value="turkish">Türk Yapımı</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              {type === 'movie' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">MANUEL FILM VIDEO URL</label>
                    <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">YOUTUBE FRAGMAN/FILM ID</label>
                    <input type="text" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">YÖNETMEN</label>
                  <input type="text" value={director} onChange={e => setDirector(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">OYUNCULAR (Virgülle ayırın)</label>
                  <input type="text" placeholder="Oyuncu 1, Oyuncu 2" value={cast} onChange={e => setCast(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-1">KÜRATÖR İNCELEME YAZISI (Kinoia Tarzı)</label>
                <textarea rows="2" value={curatorReview} onChange={e => setCuratorReview(e.target.value)} className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none"></textarea>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input type="checkbox" checked={isTop10} onChange={e => setIsTop10(e.target.checked)} className="accent-purple-600 w-4 h-4 rounded" />
                  TOP 10 Şeridine Ekle
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input type="checkbox" checked={isWeeklyRecommended} onChange={e => setIsWeeklyRecommended(e.target.checked)} className="accent-purple-600 w-4 h-4 rounded" />
                  Haftalık Önerilenlere Ekle
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-purple-400 font-bold">
                  <input type="checkbox" checked={isKids} onChange={e => setIsKids(e.target.checked)} className="accent-purple-600 w-4 h-4 rounded" />
                  Çocuk İçeriği (Animasyon/Çizgi Film)
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={handleResetForm} className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-4 rounded-2xl transition-all cursor-pointer">İptal Et</button>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 rounded-2xl transition-all cursor-pointer">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
