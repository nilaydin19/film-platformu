# KINOIA MAX - Premium Video Streaming Platform Technical Architecture Manual

This document details the engineering architecture, relational database model mappings (MySQL + Sequelize), monorepo code structure, and premium UX component implementations (Netflix overlapping ranks, HBO Max LTR fading hero, MUBI Daily selection spotlight, and Spotify-style Curator playlists) for **KINOIA MAX**.

---

## 1. TECHNICAL STACK & SYSTEM INFRASTRUCTURE

*   **Monorepo Blueprint:** Organized into two primary directories: `server` (Express API) and `client` (React SPA + Tailwind CSS v4 + Lucide).
*   **Relational Database Engine (MySQL & XAMPP):** Instead of MongoDB/Mongoose, the backend is fully powered by **Sequelize ORM** connecting to local **MySQL (XAMPP Server) on Port 3306**.
*   **Dynamic Relational Mappings to Nested JSON:** For perfect frontend component compatibility, multiple SQL relational tables (`Profiles`, `Watchlists`, `PlaybackHistory`, `Playlists`) are dynamically mapped and formatted into single nested JSON payloads via SQL eager joins and programmatic payload builders (`getUserPayload` and `getMoviePayload`).
*   **Tailwind CSS v4 Compiler Integration:** Built with `@tailwindcss/vite` compiler plugin, declaring custom themes and dark-mode neon utilities under the `@theme` directive inside `index.css`.

---

## 2. DIRECTORY TREE (MONOREPO)

```
kinoia-max/
├── server/
│   ├── package.json
│   ├── server.js              # Express app, SQL migrations, seed scripts, & API endpoints
│   ├── .env                   # XAMPP SQL ports, database credentials, & JWT Secret key
│   ├── config/
│   │   └── db.js              # Sequelize initialized database connection instance
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT validation & role enforcement (Admin vs Active Subscriber)
│   └── models/
│       ├── User.js            # Main Account model with bcrypt password hashing
│       ├── Profile.js         # Multiple viewer profiles under one User account
│       ├── Movie.js           # Movie and Series definitions, ratings, and director reviews
│       ├── Episode.js         # Episode definitions for TV shows
│       ├── Xray.js            # Amazon Prime X-Ray interactive timestamps
│       ├── Watchlist.js       # Watchlist association model (many-to-many profile/movie relation)
│       ├── PlaybackHistory.js # Playback progress reporting and "Continue Watching" logs
│       ├── Playlist.js        # Curator Custom Playlist container ("Küratör Sensin")
│       └── PlaylistMovie.js   # Custom Playlist to Movie association table
├── client/
│   ├── package.json
│   ├── vite.config.js         # Tailwind v4 integrated compiler
│   ├── src/
│   │   ├── main.jsx
│   │   ├── index.css          # Premium neon styles and HBO Max/Netflix custom typography
│   │   ├── App.jsx            # Dynamic navigation, profiling selector switchboards
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global context (login, registration, profile & subscription statuses)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx    # Left navigation panel with role-based Admin access
│   │   │   ├── MovieCard.jsx  # Card with hover-based silent YouTube autoplay trailer
│   │   │   ├── MovieSlider.jsx # Categorized sliding rows
│   │   │   ├── Hero.jsx       # LTR soft gradient-mask banner (Günün Sinematik Seçimi)
│   │   │   ├── HybridPlayer.jsx # Glassmorphic error-handling HTML5/YT player (X-Ray integrated)
│   │   │   └── ProfileSelector.jsx # Netflix-style "Who's watching?" profile selection
│   │   └── pages/
│   │       ├── Auth.jsx       # Slate-neon glassmorphic login & sign-up screens
│   │       ├── Home.jsx       # Overlapping TOP 10 row and Curator Playlists feed
│   │       ├── MovieDetail.jsx # TV show episode manager & Curator playlist popover dropdowns
│   │       └── AdminDashboard.jsx # Admin metrics dashboard & CRUD forms
```

---

## 3. CORE DATABASE ASSOCIATIONS (SEQUELIZE)

All tables are programmatically bound at database boot in `server/server.js`:

```javascript
// Account to Multi-Profiles (1-to-Many)
User.hasMany(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Profile to Watchlist & Progress History (1-to-Many)
Profile.hasMany(Watchlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Profile.hasMany(PlaybackHistory, { foreignKey: 'profileId', onDelete: 'CASCADE' });

// Curator Playlists System (Many-to-Many Profile/Movie relation)
Profile.hasMany(Playlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Playlist.belongsTo(Profile, { foreignKey: 'profileId' });

Playlist.belongsToMany(Movie, { through: PlaylistMovie, foreignKey: 'playlistId', otherKey: 'movieId', onDelete: 'CASCADE' });
Movie.belongsToMany(Playlist, { through: PlaylistMovie, foreignKey: 'movieId', otherKey: 'playlistId', onDelete: 'CASCADE' });

// TV Show to Season Episodes (1-to-Many)
Movie.hasMany(Episode, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Episode.belongsTo(Movie, { foreignKey: 'movieId' });
```

---

## 4. PREMIUM FRONTEND COMPONENT IMPLEMENTATIONS

### A) HBO Max Soft LTR Gradient Hero (`Hero.jsx`)
*   The movie image backdrop spans `%65` width absolute on the right.
*   To blend the image smoothly into the platform's `#070708` background color (avoiding harsh linear borders), a dual linear-gradient overlay operates LTR on desktop and bottom-to-top on mobile:
    ```jsx
    <div className="absolute inset-y-0 left-0 w-full md:w-[40%] bg-[#070708] z-10 hidden md:block" />
    <div className="absolute inset-y-0 left-[40%] w-[30%] bg-gradient-to-r from-[#070708] to-transparent z-10 hidden md:block" />
    ```

### B) Error-Protected Hybrid Player (`HybridPlayer.jsx`)
*   **Dual Stream Input:** Plays standard MP4/HLS links or YouTube IDs seamlessly.
*   **Interactive X-Ray:** Shows current characters and playing soundtracks during playback pause.
*   **"İçerik Şu An Bakımda" Fallback:** If a raw video link triggers an `onError` event, or if there is no active playback stream, the component immediately shifts to a dark glassmorphic security banner. It shows a heart-crack diagnostic alert, warning explanation, custom report buttons, and retry commands.

### C) Netflix Overlapping TOP 10 Shelf (`Home.jsx`)
*   Giant neon outline rank indicators (`1, 2, 3...`) sit in the background layer (`z-0`) on the bottom left.
*   The high-fidelity portrait movie poster sits in the foreground (`z-10`), overlapping the ranks with `ml-16` / `ml-20` offset shifts, generating an engaging 3D visual hierarchy.

### D) "Küratör Sensin" Playlists (`MovieDetail.jsx` & `Home.jsx`)
*   **Curator popover manager:** The `ListPlus` button next to the standard Bookmark watchlist trigger shows user-curated playlist entries. Standard profiles can check/uncheck to sync movie records instantly, or write custom titles/descriptions in the sub-form to auto-inject new compilations.
*   **Curator collage carousels:** Playlists are displayed on the Home feed in premium glassmorphic sliders using a **2x2 album art collage** of their first four movies, including curator name/avatar metadata. Clicking any compilation reveals a high-fidelity catalog modal displaying all tracks in that cinema room.

---

## 5. PLATFORM VERIFICATION STEPS

### 1. Database Setup
*   Ensure **Apache** and **MySQL** are running on **XAMPP Control Panel** (default port `3306`).

### 2. Launch API Server
```bash
cd server
npm install
npm run dev
```
*   *The bootloader checks if `kinoia` exists in SQL, migrates tables automatically, and loads default accounts: `admin@kinoia.com` / `kinoia123` & `user@kinoia.com` / `kinoia123`.*

### 3. Launch React Frontend
```bash
cd client
npm install
npm run dev
```
*   *Launches Vite hot module server on `http://localhost:5173/`.*

---

## 6. PRIME-STYLE LOGIN, CINEMATIC LOGO INTRO ANIMATION & 3D CHECKOUT SYSTEM

### A) Cinematic Splash Animation & Web Audio API
- When the browser loads, a futuristic purple neon "KINOIA MAX" logo appears on a pitch-black background.
- **Letter Expand Animation:** The logo dynamically animates from `tracking-widest` to `tracking-normal` with a smooth shimmer effect.
- **Sound Support:** A deep, futuristic sub-bass sweeps automatically upon splash initialization using the Web Audio API (`AudioContext`), ensuring zero external file dependency and 100% platform reliability.

### B) Prime-style Cover Grid Collage & Accordion Login
- **Movie Cover Collage:** The landing page background showcases a dark, blurred collage of actual movie covers from our platform (e.g., Dune, Oppenheimer, Şahsiyet).
- **Accordion Authentication Forms:** Clicking "Sign In" pürüzsüzce slides open the login form in a premium glassmorphic accordion container.
- **Privacy Agreement Modal:** Contains a professional scrollable privacy and user terms overlay modal.

### C) Interactive 3D Flipping Card & Tier Selector
- **3-Step Checkout Flow:** Account Creation -> Tier Selector (Base: 99 TL, Premium: 149 TL, Max Family: 199 TL) -> Interactive Payment.
- **3D Card Flip:** CVV field focus flips the card using standard CSS 3D transforms (`perspective-1000 rotate-y-180 preserve-3d`), automatically updating details as the user types.
- **SQL Synchronization:** Upon successful simulated checkout, `subscriptionStatus` is updated to `'active'` in the MySQL database and logs the profile in.

