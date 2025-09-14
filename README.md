# 🌸 AnimeSkdool  

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/chouhan-abhi/AnimeSkdool)

AnimeSkdool is a **next-gen anime companion app** built for fans who don’t just watch anime—they **live by it**.  
From keeping track of weekly airings to building a personal watchlist and exploring hidden gems, AnimeSkdool helps you **discover, organize, and never miss your favorite shows**.  

Powered by the **Jikan API** and optimized with modern web tech, it delivers a **smooth, offline-friendly, and highly customizable experience**.

---

## ✨ Key Features  

- **🗓️ Smart Weekly Calendar**  
  A dynamic schedule that shows exactly when your favorite anime airs each week. Switch between **day view** or **full week view** to plan your binge.  

- **🔍 Explore & Discover**  
  Browse **top-ranked, trending, and upcoming anime** with advanced filters for type, genre, popularity, and rating.  

- **⭐ Unified Watchlist + Starred Favorites**  
  Save entire anime objects (not just IDs) directly to your personal watchlist. Mark favorites with a **Starred tag** for easy access—even works offline with cached data.  

- **📄 Deep Anime Profiles**  
  Every anime comes with rich details: synopsis, trailers, genres, studios, ratings, and more.  

- **🎲 Recommendation Carousel**  
  Get random curated picks when you’re not sure what to watch next.  

- **⚡ Blazing Fast Search**  
  Instant, responsive search powered by React Query and caching—find anime without waiting.  

- **🎨 Customizable Experience**  
  Choose your **primary color theme**, tweak fonts, and personalize UI settings.  

- **📦 Offline-First Design**  
  Thanks to a **progressive service worker**, AnimeSkdool keeps working with cached schedules, starred anime, and watchlists even when offline.  

---

## 🖼️ Screenshots & Previews  

Here’s a sneak peek of what AnimeSkdool looks like:  

### 📅 Weekly Schedule  
![Weekly Schedule](./screenshots/skdool5.png)  

### 🔍 Explore & Discover  
![Explore Page](./screenshots/skdool3.png)  

### ⭐ Watchlist & Starred Anime  
![Watchlist](./screenshots/skdool2.png)  

### 🎨 Customizable UI  
![Themes](./screenshots/skdool-settings.png)

*(Replace the placeholders above with actual screenshots or GIFs from your app once available.)*  

---

## 🛠️ Tech Stack  

- **Frontend:** React (with Vite ⚡ for ultra-fast builds)  
- **Data Fetching & State:** TanStack Query (React Query) for caching + background updates  
- **Styling:** Tailwind CSS (utility-first, responsive, modern)  
- **Icons:** Lucide React  
- **Storage:** LocalStorage manager for persistent user data (watchlist, starred anime, settings)  
- **Offline Support:** Service Worker with **dynamic runtime caching**  

---

## 🚀 Getting Started  

To run AnimeSkdool locally:  

### Prerequisites  
- Node.js (v16+)  
- npm (or any compatible package manager)  

### Installation  

```bash
# 1. Clone the repository
git clone https://github.com/chouhan-abhi/AnimeSkdool.git

# 2. Navigate into the project
cd AnimeSkdool

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
