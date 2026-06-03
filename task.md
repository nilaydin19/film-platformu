# Kinoia Streaming Platform - Uygulama Kontrol Listesi

Bu liste, projenin adım adım ve eksiksiz bir şekilde kurulup kodlanmasını takip etmek için kullanılacaktır.

## 1. Monorepo ve Başlangıç Kurulumları
- [x] Proje klasör yapısının (`server` ve `client`) oluşturulması
- [x] Sunucu bağımlılıklarının (`express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `nodemon`) kurulması
- [x] Arayüz bağımlılıklarının (`react`, `vite`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `react-router-dom`) kurulması
- [x] Tailwind CSS v4 Vite derleyici yapılandırmasının (`vite.config.js`) oluşturulması

## 2. Sunucu (Backend) Geliştirme
- [x] MongoDB film şemasının X-Ray sahneleri, küratör incelemeleri, içerik tipi ve diziler için sezon/bölüm yapısıyla oluşturulması (`server/models/Movie.js` - type, seasons)
- [x] Kullanıcı şemasının çoklu profil, izleme listesi ve izleme ilerlemesiyle oluşturulması (`server/models/User.js`)
- [x] Yetkilendirme ve Yönetici Yetkisi ara katman yazılımlarının yazılması (`server/middleware/authMiddleware.js`)
- [x] Profil geçiş, profil ekleme, ilerleme kaydetme ve watchlist rotalarının sunucuya entegre edilmesi (`server/server.js`)
- [x] Express sunucusunun ve tüm API uç noktalarının (Kayıt, Giriş, Filmler, Oynatma Yetkisi, Admin istatistikleri ve Seed verileri) yazılması (`server/server.js`)

## 3. Arayüz (Frontend) Geliştirme
- [x] Global stil tanımlamalarının ve HBO Max/Netflix tarzı görünümlerin eklenmesi (`client/src/index.css`)
- [x] Oturum, Profil ve Rol yönetimi Context API'sinin kurulması (`client/src/context/AuthContext.jsx`)
- [x] Netflix tarzı "Kim İzliyor?" Profil Seçme ve Oluşturma Ekranının kodlanması (`client/src/components/ProfileSelector.jsx`)
- [x] Rol seçimi içeren Giriş ve Kayıt ekranının kodlanması (`client/src/pages/Auth.jsx`)
- [x] Admin Paneli desteği sunan sol dikey / mobil alt yatay menünün tasarlanması (`client/src/components/Sidebar.jsx`)
- [x] Kart üzerinde sessizce YouTube fragmanı oynatan Autoplay Card bileşeninin yazılması (`client/src/components/MovieCard.jsx`)
- [x] Yatay kaydırılabilir "İzlemeye Devam Et" (ilerleme çubuklu) ve popüler şeritlerinin kodlanması (`client/src/components/MovieSlider.jsx`)
- [x] Arama Barı, Kelime filtreleri ve yatay tıklanabilir Türler Çubuğunun yazılması (`client/src/pages/Home.jsx`)
- [x] MUBI küratör notlarını barındıran Günün Filmi vitrin kartının tasarlanması (`client/src/pages/Home.jsx`)
- [x] Duraklatıldığında Sahne X-Ray Panelini açan ve izleme süresini sunucuya raporlayan Akıllı Oynatıcının kodlanması (`client/src/components/HybridPlayer.jsx`)
- [x] Film ve Dizi ayrımını süzerek sadece ilgili türü gösteren "Filmler" ve "Diziler" ayrı sayfalarının kodlanması (`client/src/App.jsx`)
- [x] Kullanıcının kaydettiği tüm içerikleri listeleyen "Listem" (Watchlist) sayfasının kodlanması (`client/src/App.jsx`)
- [x] Sezon dropdown seçicisi ve bölüm listeleme kartları içeren, "Benzer Öneriler" algoritması destekli Detay sayfasının yapılması (`client/src/pages/MovieDetail.jsx`)
- [x] İstatistik kartları, CRUD film formları ve listeleme arayüzü barındıran Admin Paneli bileşeninin yazılması (`client/src/pages/AdminDashboard.jsx`)
- [x] Uygulama yönlendirme ve profil geçiş yapısının tamamlanması (`client/src/App.jsx`)

## 4. Testler ve Doğrulama
- [x] API uç noktalarının test edilmesi
- [x] Giriş yapmamış kullanıcıların filmlere erişemediğinin doğrulanması
- [x] Giriş yapmış fakat aboneliği aktif olmayan kullanıcıların video oynatamadığının (403 hatası aldığının) doğrulanması
- [x] Yönetici (Admin) kullanıcının aboneliği aktif olmasa bile tüm filmleri izleyebildiğinin test edilmesi
- [x] Admin olmayan kullanıcıların Admin paneline veya istatistik uç noktalarına (403 hatası aldığının) erişemediğinin kontrolü
- [x] Netflix Çoklu profil ekleme ve geçiş sisteminin hatasız çalıştığının doğrulanması
- [x] Netflix "İzlemeye Devam Et" ilerleme yüzdesinin veritabanına doğru kaydedildiğinin ve Home sayfasında listelendiğinin kontrolü
- [x] Amazon Prime X-Ray panelinin duraklatma (Pause) esnasında doğru sahnede doğru kişileri listelediğinin doğrulanması
- [x] Film kartlarının hover durumunda sessiz fragmanı (Autoplay) hatasız başlattığının testi
- [x] "Filmler" ve "Diziler" sekmelerinin içerikleri türüne göre (movie/series) doğru ayırdığının kontrolü
- [x] Dizi detayına girildiğinde sezon değiştirme dropdownunun ve bölüm listelerinin doğru güncellendiğinin testi
- [x] Bölüme tıklandığında oynatıcının o bölümün fragman veya video linkini doğru yüklediğinin doğrulanması
- [x] Arama motorunun başlık, oyuncu adı ve özet kelimelerini doğru listelediğinin testi
- [x] Tür filtrelerinin (Romantik Komedi, Dram vb.) doğru süzme işlemi yaptığının kontrolü
- [x] Detay sayfasında eşleşen türdeki filmlerin "Benzer Öneriler" olarak başarıyla listelenmesi
- [x] Mobil duyarlılık (responsive) ve karanlık tema görsellerinin son kontrolleri

## 5. Çoklu Dil Çevirileri ve Dil Filtreleme Geliştirmesi
- [x] `main.jsx` içerisine `LanguageProvider` sarmalanması
- [x] `Sidebar.jsx` bileşenine `useLanguage` kancasının entegre edilmesi ve premium Globe dropdown dil seçicinin kodlanması
- [x] `Sidebar.jsx` üzerindeki butonların ve statik metinlerin `t()` fonksiyonu ile yerelleştirilmesi
- [x] `Home.jsx` üzerinde `t()` yerelleştirmesi ve dil filtreleme şeridinin (Tümü, Türkçe, İngilizce, Rusça, Almanca, Fransızca) kodlanması
- [x] `Home.jsx` üzerindeki film listelemesinin seçilen dil filtresine göre süzülmesi (`matchesLanguage` süzgeci)
- [x] `Hero.jsx` üzerindeki butonların ve etiketlerin yerelleştirilmesi
- [x] `MovieDetail.jsx` üzerindeki tüm detay ve küratör playlist form metinlerinin yerelleştirilmesi
- [x] `Auth.jsx` ve `ProfileSelector.jsx` bileşenlerinin yerelleştirilmesi
- [x] Tüm dillerde (TR, EN, RU, DE, FR) arayüz geçişlerinin doğrulanması ve dil filtresinin test edilmesi

## 6. Prime-style Giriş, Splash Animasyonu ve 3D Kartlı Abonelik Sistemi
- [x] `index.css` içerisine 3D kart dönme efektleri ve fütüristik pulse neon logo animasyonlarının eklenmesi
- [x] `MovieDetail.jsx` içerisindeki "Şimdi İzle" butonunun kontrast hatasının düzeltilmesi
- [x] `Auth.jsx` içerisine 3 saniyelik sinematik KINOIA MAX Splash intro animasyonunun entegre edilmesi (Web Audio API ile derin bas ses sentezi dahil!)
- [x] `Auth.jsx` içerisine Prime Video esintili afiş kolajlı karşılama ve giriş ekranının kodlanması
- [x] `Auth.jsx` içerisine Gizlilik Politikası ve Kullanım Koşulları modal pencerelerinin eklenmesi
- [x] `Auth.jsx` içerisine interaktif sanal 3D Kredi Kartı ödemeli 3 adımlı deneme süreci abonelik akışının entegre edilmesi
- [x] Tüm arayüz entegrasyonunun HMR ile test edilip doğrulanması

## 7. Netflix Tarzı Fragman Arka Planı ve Admin Şikayet Yönetimi
- [x] `MovieDetail.jsx` içerisine Netflix tarzı karartmalı otomatik dönen YouTube fragman arka planı (cinematic auto-loop iframe) entegre edilmesi
- [x] Oynatıcı (`HybridPlayer.jsx`) hata ve bakım ekranı yerine, backend `POST /api/issues` API'sine doğrudan şikayet ileten interaktif formun entegre edilmesi
- [x] `server/models/Issue.js` veritabanı şemasının ve API rotalarının (GET, PUT status, DELETE) Sequelize/MySQL ile kurulması
- [x] `AdminDashboard.jsx` içerisine "Sorunlar & Şikayetler" tabının, glowing "Bekleyen Şikayetler" durum kartının ve sorun çözme/silme eylemlerinin entegre edilmesi
