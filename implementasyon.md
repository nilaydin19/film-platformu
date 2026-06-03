# KINOIA MAX - Dünya Standartlarında Sinematik Video Akış Platformu Mimari Belgesi

Bu belge; **KINOIA MAX** video akış platformunun Express.js + MySQL (Sequelize ORM) ve React.js (Vite + Tailwind CSS v4) monorepo yığınağındaki yazılım mimarisini, veritabanı ilişkilerini ve premium HBO Max, Netflix ve MUBI esintili kullanıcı deneyimi bileşenlerini ayrıntılı olarak açıklamaktadır.

---

## 1. YÜKSEK SEVİYE TEKNOLOJİ YIĞINI VE ALTYAPI

*   **Monorepo Yapısı:** Proje, tek bir çatı dizin altında `server` (Backend API) ve `client` (Frontend React) olmak üzere iki ana modüle ayrılmıştır.
*   **İlişkisel Veritabanı ve XAMPP Entegrasyonu:** Mongoose (MongoDB) yerine yerel **XAMPP Server (MySQL on Port 3306)** üzerinde çalışan **Sequelize ORM** tercih edilmiştir. 
*   **Dinamik JSON Mappings:** İlişkisel veritabanı tablolarındaki (Profiles, Playlists, PlaybackHistory, Watchlists) veriler, frontend tarafının beklediği iç içe geçmiş (nested) JSON nesnesi biçimlerine `getUserPayload` ve `getMoviePayload` metotlarıyla dinamik olarak dönüştürülerek 100% veri yapısı uyumluluğu sağlanmıştır.
*   **Tailwind CSS v4 Derleyicisi:** Arayüz derlemesi için Tailwind v4'ün yerleşik `@tailwindcss/vite` derleme kütüphanesi kullanılmıştır. Tüm global temalandırma ve neon stil belirteçleri doğrudan `index.css` içindeki `@theme` direktifi altında toplanmıştır.

---

## 2. KINOIA MAX YAZILIM AĞACI (MONOREPO)

```
kinoia-max/
├── server/
│   ├── package.json
│   ├── server.js              # SQL Bootloader, Seed, ve tüm API Rotaları
│   ├── .env                   # XAMPP Veritabanı ve JWT Kimlik Bilgileri
│   ├── config/
│   │   └── db.js              # Sequelize Veritabanı Yapılandırması
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT Yetkilendirme & Rol Tabanlı Denetim
│   └── models/
│       ├── User.js            # Kullanıcı Hesabı & bcrypt Şifreleme
│       ├── Profile.js         # Çoklu Netflix Profili (Ana Profil, Çocuk vs.)
│       ├── Movie.js           # Film/Dizi Özellikleri, Küratör İncelemeleri
│       ├── Episode.js         # Diziler için Bölüm Şeması
│       ├── Xray.js            # Sahnelerdeki Oyuncu ve Müzik Haritaları
│       ├── Watchlist.js       # Profil İzleme Listeleri (Çoka-Çok İlişki)
│       ├── PlaybackHistory.js # İlerleme Yüzdesi & İzlemeye Devam Et Tablosu
│       ├── Playlist.js        # Küratör Çalma Listesi ("Küratör Sensin")
│       └── PlaylistMovie.js   # Çalma Listesi ve Filmler Eşleştirme Tablosu
├── client/
│   ├── package.json
│   ├── vite.config.js         # Tailwind v4 Entegre Vite Konfigürasyonu
│   ├── src/
│   │   ├── main.jsx
│   │   ├── index.css          # Koyu Neon Temalandırma ve HBO Max Fontları
│   │   ├── App.jsx            # Navigasyon, Tablar ve Profil Seçici Geçişleri
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global State (Giriş, Profil & Abonelik Yetkileri)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx    # Admin Paneli Destekli Sol Navigasyon Menüsü
│   │   │   ├── MovieCard.jsx  # Sessiz YouTube Fragmanı Oynatan Autoplay Kartı
│   │   │   ├── MovieSlider.jsx # Popüler ve Kategorize Yatay Şerit Kaydırıcı
│   │   │   ├── Hero.jsx       # Günün Sinematik Seçimi LTR Soft Gradient Banner
│   │   │   ├── HybridPlayer.jsx # Hata Korumalı Glassmorphic Oynatıcı (X-Ray Destekli)
│   │   │   └── ProfileSelector.jsx # Netflix Tarzı "Kim İzliyor?" Seçim Ekranı
│   │   └── pages/
│   │       ├── Auth.jsx       # Koyu HBO Max Temalı Giriş & Kayıt Sayfası
│   │       ├── Home.jsx       # Overlapping TOP 10 ve Küratör Odaları Feed'i
│   │       ├── MovieDetail.jsx # Sezon/Bölüm Seçicili Detay & Çalma Listesi Paneli
│   │       └── AdminDashboard.jsx # Stats, Film CRUD ve Dizi Yönetim Paneli
```

---

## 3. KRİTİK VERİTABANI İLİŞKİLERİ VE SQL SEMASI

Bütün ilişkiler Sequelize model seviyesinde `server/server.js` üzerinde kurularak otomatik senkronize edilmektedir:

```javascript
// 1. Hesap -> Netflix Profilleri (Birden-Çoka)
User.hasMany(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// 2. Profil -> İzleme Listesi & İzleme İlerleme Geçmişi
Profile.hasMany(Watchlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Profile.hasMany(PlaybackHistory, { foreignKey: 'profileId', onDelete: 'CASCADE' });

// 3. Küratör Playlist Sistemi ("Küratör Sensin" Çoka-Çok İlişki)
Profile.hasMany(Playlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Playlist.belongsTo(Profile, { foreignKey: 'profileId' });

Playlist.belongsToMany(Movie, { through: PlaylistMovie, foreignKey: 'playlistId', otherKey: 'movieId', onDelete: 'CASCADE' });
Movie.belongsToMany(Playlist, { through: PlaylistMovie, foreignKey: 'movieId', otherKey: 'playlistId', onDelete: 'CASCADE' });

// 4. Diziler -> Bölümler (Birden-Çoka)
Movie.hasMany(Episode, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Episode.belongsTo(Movie, { foreignKey: 'movieId' });
```

---

## 4. PREMIUM KULLANICI DENEYİMİ (UX) TASARIM REVİZELERİ

### A) Günün Sinematik Seçimi (Hero.jsx) - HBO Max LTR Gradient tekniği
*   Film görseli container'ın sağ tarafına `%65` genişliğinde konumlandırılmıştır.
*   Sol taraftaki başlık ve buton içeriğinin okunabilirliğini artırmak için `#070708` (platform arka plan rengi) renginden sağa doğru pürüzsüzce eriyen sol-sağ doğrusal gradyan maskesi uygulanmıştır:
    ```jsx
    <div className="absolute inset-y-0 left-0 w-full md:w-[40%] bg-[#070708] z-10 hidden md:block" />
    <div className="absolute inset-y-0 left-[40%] w-[30%] bg-gradient-to-r from-[#070708] to-transparent z-10 hidden md:block" />
    ```
*   Bu sayede görsel ile arka plan arasında hiçbir keskin sınır kalmayıp, arayüz adeta bir sinema perdesi gibi akmaktadır.

### B) Hata Korumalı Hibrit Oynatıcı (HybridPlayer.jsx)
*   **Çift Kaynak Desteği:** Film veya dizi bölümleri hem `.mp4`/HLS video URL'si ile HTML5 oynatıcıda hem de YouTube Video ID'si ile özelleştirilmiş iframe üzerinde oynatılabilir.
*   **Glassmorphic Bakım Modu Fallback:** `<video>` etiketi üzerinde bir `onError` tetiklendiğinde veya oynatılacak kaynak bulunamadığında, oynatıcı anında **KINOIA GÜVENLİK DUVARI** ekranına geçiş yapar.
*   Kırmızı neon blur gölgesi olan, şık ve yarı şeffaf bir cam panel (glass-panel) içinde **"İçerik Şu An Bakımda"** uyarısı, bir sorun bildirme butonu ve oynatıcıyı kapatma/tekrar deneme butonları gösterilir.

### C) Haftalık TOP 10 Rütbe Şeridi (Home.jsx) - Netflix Üst Üste Binme
*   HBO Max/Netflix tarzı içi boş, dışı mor neon kontürlü dev sıralama sayıları (`1, 2, 3...`) film afişlerinin arkasına `z-0` seviyesinde yerleştirilmiştir.
*   Dikey portrait poster afişleri `z-10` z-index değeri ve `ml-16` / `ml-20` marjin kaydırmalarıyla sayıların üzerine hafifçe binerek 3 boyutlu derinlik hissi vermektedir.

### D) "Küratör Sensin" playlist sistemi (MovieDetail.jsx & Home.jsx)
*   **Film Detay Sayfası:** İzleme listesi butonunun yanına yerleştirilen `ListPlus` butonu, şık bir popover çalma listesi menüsü açar. 
*   Kullanıcı mevcut listelerinden birini seçip tek tıkla filmi ekleyebilir/kaldırabilir ya da popover'ın altındaki formla anında yeni bir tematik liste (Örn: *"Yağmurlu Pazar Depresyonu"*) oluşturup filmi içine ekleyebilir.
*   **Bölüm Seçici:** Dizi detay sayfalarında dinamik sezon/bölüm seçici arayüzü bulunur. Kullanıcı tıkladığı bölümü oynatıcıya yükleyebilir.
*   **İşlevsel Filmler & Diziler Sayfaları:**
    *   `movies` sekmesinde sadece filmler, `series` sekmesinde ise sadece diziler, kendi türler çubukları (genre bar) ve özel kürasyon şeritleri ile listelenir.
*   **Küratör Odaları:**
    *   Profillerin kaydettiği tüm film ve dizileri listeleyen, grid biçiminde tasarlanmış premium **Küratör Odaları** ekranı.
*   **Tip Güvenli Eşleştirme ve Dinamik Profil Güncelleme:**
    *   ID eşleşmelerindeki (String vs Integer) veri tabanı uyumsuzlukları `String()` dönüşümleriyle tamamen giderilmiş, profil geçişlerindeki senkronizasyon ise `switchProfile` Context metoduyla anlık ve dinamik hale getirilmiştir.
*   **Çoklu Profil Sistemi:** Netflix tarzı, her kullanıcı hesabına tanımlı birden fazla izleyici profili (yetişkin/çocuk kısıtlamalı) arasında anlık geçiş ve kişiselleştirilmiş veri izolasyonu.

---

## 5. PLATFORM DOĞRULAMA VE ÇALIŞTIRMA TALİMATLARI

### 1. Veritabanının Çalıştırılması
*   XAMPP Control Panel üzerinden **Apache** ve **MySQL** sunucularını başlatın.
*   Varsayılan MySQL portunun `3306` olduğundan emin olun.

### 2. Node.js Backend Server Kurulumu ve Başlatılması
```bash
cd server
npm install
npm run dev
```
*   *API sunucusu otomatik olarak MySQL içinde `kinoia` adında bir şema oluşturacak, tabloları senkronize edecek ve test için varsayılan `admin@kinoia.com` (şifre: `kinoia123`) ve `user@kinoia.com` (şifre: `kinoia123`) hesaplarını otomatik tohumlayacaktır.*

### 3. Vite React Frontend Kurulumu ve Başlatılması
```bash
cd client
npm install
npm run dev
```
*   *Uygulama `http://localhost:5173/` adresi üzerinden yayına başlar.*

---

## 6. PRİME-STYLE GİRİŞ EKRANI, SİNEMATİK LOGO INTRO ANIMASYONU VE 3D KARTLI ABONELİK SİSTEMİ

### A) Sinematik Giriş (Splash) Animasyonu & Web Audio API
- Tarayıcı yüklendiğinde zifiri karanlık arka plan üzerinde fütüristik mor neon "KINOIA MAX" logosu belirir.
- **Harf Yayılım Animasyonu:** Logo `tracking-widest` durumundan yavaşça genişleyerek `tracking-normal` durumuna geçer ve pürüzsüzce parlar (shimmer).
- **Ses Desteği:** Splash intro başlarken Web Audio API (`AudioContext`) aracılığıyla tamamen kod tabanlı, zengin ve derin bir sinematik bas ses sentezi (low-frequency sound sweep) başlatılır. Bu sayede hiçbir dış ses dosyasına bağımlı kalmadan %100 uyumlulukla çalışır.

### B) Prime-style Tanıtım ve Karşılama Kolajı
- **Film Afişi Kolajı:** Giriş sayfasının arka planı, sitedeki popüler filmlerin (Dune, Oppenheimer, Şahsiyet vb.) afişlerinden oluşan, karartılmış ve bulanıklaştırılmış şık bir grid kolajıdır.
- **Akordiyon Giriş Formu:** Giriş formu, "Giriş Yap" linkine tıklandığında pürüzsüzce açılan modern bir akordiyon animasyonuyla sunulur.
- **Gizlilik Sözleşmesi Modalı:** Platformun "Kullanım Koşulları ve Gizlilik Politikası" okunaklı ve kaydırılabilir glassmorphic bir modal pencere ile sunulur.

### C) Sanal 3D Kredi Kartı & Paket Seçimi
- **3 Adımlı Akış:** Hesap Oluşturma -> Paket Seçimi -> 3D Kredi Kartı ile Ödeme.
- **Sanal 3D Kart:** Kullanıcı kart bilgilerini yazarken kart görseli anlık güncellenir. CVV hanesine odaklanıldığında kart 3D dönme efekti (`perspective-1000 rotate-y-180 preserve-3d`) ile pürüzsüzce arkasını döner.
- **Veritabanı Entegrasyonu:** Ödeme başarıyla tamamlandığında veritabanındaki kullanıcı kaydına `subscriptionStatus: 'active'` verisi yazılır ve profil seçim ekranına geçilir.

---

KINOIA MAX, bir yazılım mimarı hassasiyetiyle, en üst düzey performans, temiz kod disiplini ve büyüleyici bir görsel estetik ile hayata geçirilmiştir. Keyifli seyirler!

