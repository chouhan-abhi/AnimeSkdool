<h1 align="center">AniSkdool</h1>

<p align="center">
  <i>Discover, track, and explore anime with a stunning, lightning-fast interface</i><br/>
  Built with ⚡ <b>React</b> + 🎨 <b>Tailwind CSS</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Lazy%20Loading-Optimized-success" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## 🖼️ Preview

<p align="center">
  <img src="https://github.com/<your-username>/animescope/assets/preview-desktop.png" alt="AnimeScope desktop preview" width="800"/>
</p>

<p align="center">
  <img src="https://github.com/<your-username>/animescope/assets/preview-mobile.png" alt="AnimeScope mobile preview" width="300"/>
</p>

---

## 🌟 Features

### 🎬 Explore & Search
- Lightning-fast anime search powered by the **Jikan API (MyAnimeList)**  
- Responsive card grid with hover animations and lazy-loaded images  
- Search updates instantly with no full reloads  

### 📖 Detailed Anime View
- Elegant **slide-in detail panel** with full synopsis, ratings, and metadata  
- Optimized **lazy-loading** for heavy components  
- Background image with **blur + dark overlay** for perfect readability  
- Mobile-first behavior: opens from half the screen, supports swipe up/down gestures  

### 💾 Track Your Favorites
- ⭐ **Starred list** for your all-time favorites  
- 🎬 **Watchlist** saved to `localStorage` — persistent even after refresh  
- One-click bookmarking with animated feedback  

### 💡 Recommendations & Reviews
- “Anime Recommendations” and “Recent Reviews” sidebar sections  
- Dynamically lazy-loaded for minimal main bundle size  
- Beautiful cards and gradient UI  

### ⚡ Performance
- React 18 Suspense + `React.lazy()` for all large components  
- Memoized renders and optimized scrollable sections  
- GPU-friendly background blurs (`filter: blur()` + opacity layers)  
- Split code by page and on-demand component loading  

---

## 🧩 Tech Stack

| Category | Tools |
|-----------|--------|
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS (utility-first, responsive design) |
| **Data Layer** | Jikan REST API (MyAnimeList) |
| **Icons** | Lucide React |
| **State & Fetching** | React Query-style hooks (`useAnimeSearch`, `useStarredAnime`) |
| **Storage** | LocalStorage (via custom `storageManager`) |
| **Performance** | React.lazy, Suspense, code splitting |

---

## 📁 Project Structure

