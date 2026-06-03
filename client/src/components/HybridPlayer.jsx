import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Music, User, AlertTriangle, RefreshCw, ArrowLeft, HeartCrack } from 'lucide-react';

export default function HybridPlayer({ movie, onBack }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);
  
  // Sorun bildirme eyaletleri
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  const isYouTube = !!movie.youtubeId;
  const hasPlayableSource = !!(movie.youtubeId || movie.videoUrl);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    setSubmittingReport(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://film-platformu-server.vercel.app/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: movie._id || movie.id,
          movieTitle: movie.title,
          description: reportDescription
        })
      });
      if (response.ok) {
        setReportSuccess(true);
        setReportDescription('');
        setTimeout(() => {
          setReportSuccess(false);
          setShowReportModal(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Şikayet gönderilemedi:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Kaynak değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    setHasError(!hasPlayableSource);
  }, [movie, hasPlayableSource]);

  // Video durum izleme (İlerlemeyi veri tabanına yazma)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && !isYouTube && !hasError) {
        const time = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setCurrentTime(time);
        setDuration(dur);
        updateProgress(time, dur);
      }
    }, 5000); // Her 5 saniyede bir raporlar
    return () => clearInterval(interval);
  }, [isPlaying, isYouTube, movie, hasError]);

  const updateProgress = async (progress, total) => {
    if (!total || hasError) return;
    try {
      await fetch(`https://film-platformu-server.vercel.app/api/movies/${movie._id || movie.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ progressSeconds: Math.floor(progress), durationSeconds: Math.floor(total) })
      });
    } catch (err) {
      console.error('İlerleme kaydedilemedi:', err);
    }
  };

  const handleVideoError = (e) => {
    console.error("Video yüklenirken veya oynatılırken bir hata oluştu:", e);
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Mock X-Ray Bilgileri (Zamanlama bazlı veri)
  const currentScene = (movie.xray && movie.xray.find(x => currentTime >= x.timeStart && currentTime <= x.timeEnd)) || {
    characters: movie.cast?.slice(0, 2) || ["Bilinmeyen Oyuncu"],
    song: "Kinoia Orijinal Müziği"
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group/player">
      
      {/* HATA DURUMU / BAKIM MODAL FALLBACK EKRANI */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070708]/95 backdrop-blur-xl z-30 p-6 text-center animate-fade-in pointer-events-auto">
          {/* Glassmorphic Panel Container */}
          <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 via-[#111113]/80 to-[#070708] shadow-2xl flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-red-500/30 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <HeartCrack className="w-8 h-8" />
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
                KINOIA MAX GÜVENLİK DUVARI
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">İçerik Şu An Bakımda</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                İstediğiniz video kaynağına şu an erişilemiyor veya kırık link algılandı. Teknik sinema küratörlerimiz sorunu çözmek için bakım çalışmalarına başladı.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-purple-600 hover:text-white font-bold py-3 rounded-2xl text-xs cursor-pointer shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar Dene
              </button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-2xl text-xs cursor-pointer transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Sorun Bildir
              </button>
              {onBack && (
                <button 
                  onClick={onBack}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold py-3 rounded-2xl text-xs cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri Dön
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL OYNATICI ALANI */
        <>
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&color=white`}
              title={movie.title}
              allowFullScreen
              className="w-full h-full border-0"
              onError={() => setHasError(true)}
            />
          ) : (
            <video 
              ref={videoRef}
              src={movie.videoUrl} 
              controls 
              autoPlay 
              onError={handleVideoError}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full"
              poster={movie.thumbnail}
            />
          )}

          {/* HATA RAPORLAMA BUTONU VE SİNEMA KONTROL ROZETLERİ (Hover durumunda görünür) */}
          <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 bg-black/60 backdrop-blur border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all shadow-lg"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Sorun Bildir
            </button>
          </div>

          {/* AMAZON PRIME STİLİ DURAKLATILDIĞINDA GELECEK X-RAY PANELİ */}
          {!isYouTube && !isPlaying && (
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#070708]/95 via-[#070708]/50 to-transparent p-6 text-white animate-fade-in pointer-events-none z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    X-RAY İNTERAKTİF
                  </span>
                  <h4 className="text-xl font-black">{movie.title}</h4>
                  <p className="text-xs text-gray-300">Yönetmen: {movie.director || 'Denis Villeneuve'}</p>
                </div>

                <div className="flex gap-4 text-xs text-gray-300 bg-black/60 backdrop-blur border border-white/5 p-3.5 rounded-2xl">
                  <div className="space-y-1 border-r border-white/10 pr-4">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Sahnede Olanlar</span>
                    <div className="flex flex-col gap-1 mt-1 font-semibold text-gray-200">
                      {currentScene.characters.map((char, idx) => (
                        <span key={idx} className="flex items-center gap-1.5"><User className="w-3 h-3 text-purple-400" /> {char}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 pr-2">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Sahne Müziği</span>
                    <span className="flex items-center gap-1.5 mt-1 text-purple-400 font-extrabold"><Music className="w-3 h-3 shrink-0" /> {currentScene.song}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SORUN BİLDİRME MODAL ARAYÜZÜ OVERLAY */}
      {showReportModal && (
        <div className="absolute inset-0 bg-[#070708]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-6 animate-fade-in text-center pointer-events-auto">
          <div className="max-w-md w-full p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 via-[#111113]/90 to-[#070708] shadow-2xl flex flex-col items-center space-y-4">
            
            <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-500 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Sorun ve Şikayet Bildir</h3>
              <p className="text-[11px] text-gray-400">
                "{movie.title}" içeriğiyle ilgili yaşadığınız problemi teknik ekibimize iletin.
              </p>
            </div>

            {reportSuccess ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-2xl animate-pulse">
                Sorununuz başarıyla iletildi. Teknik ekibimiz incelemeye başladı! 🎬
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="w-full space-y-3">
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Video açılmıyor, ses senkronizasyonu bozuk veya altyazı hatalı..."
                  className="w-full bg-[#070708] border border-white/5 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all font-semibold resize-none"
                />
                
                <div className="flex gap-3 w-full">
                  <button 
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 font-bold py-3 rounded-2xl text-xs cursor-pointer transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingReport}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-purple-600/20"
                  >
                    {submittingReport ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
