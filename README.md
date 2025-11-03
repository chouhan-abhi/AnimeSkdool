
# AniSkdool

**Discover, track, and explore anime beautifully.**  
A modern anime explorer powered by [Jikan API](https://docs.api.jikan.moe/) (MyAnimeList), built with **React + Tailwind CSS**, featuring dark & light themes, lazy loading, and stunning UI animations.

---

## 🖼️ Screenshots

| Detail view |
|:-------------:|
| ![Screenshot 6](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui6.png) |

| Desktop View | Watchlist |
|:-------------:|:-----------:|
| ![Screenshot 1](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui1.png) | ![Screenshot 2](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui2.png) |

| Calendar | Explore | Settings |
|:-------------:|:----------:|:----------------:|
| ![Screenshot 3](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui3.png) | ![Screenshot 4](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui4.png) | ![Screenshot 5](https://raw.githubusercontent.com/chouhan-abhi/AnimeSkdool/refs/heads/main/public/screenshots/Aniskdool%20ui5.png) |

---

## ✨ Features

### 🎬 Explore & Search
- Super-fast search powered by the **Jikan API**
- Smooth card grid with hover animations and lazy-loaded images
- Instant search results without page reloads

### 📖 Detailed Anime View
- Elegant **slide-in panel** with synopsis, rating, and metadata  
- Mobile view opens from half screen — swipe up/down to expand/collapse  
- Background image automatically blurred and darkened for readability  
- Optimized rendering using React Suspense & lazy loading  

### 💾 Track Your Favorites
- ⭐ **Starred list** for your favorite animes  
- 🎬 **Watchlist** persists with `localStorage`  
- One-click add/remove with instant visual feedback  

### 💡 Recommendations & Reviews
- Smart “Random Recommendations” & “Recent Reviews” side sections  
- Lazy-loaded for faster initial page loads  
- Polished material-inspired dark/light themes  

### ⚡ Performance
- Code-splitting and dynamic imports using `React.lazy()`  
- Memoized renders & scroll virtualization  
- GPU-accelerated blur and transform effects  
- Responsive design from mobile to ultrawide screens  

---

## 🧩 Tech Stack

| Category | Tools / Libraries |
|-----------|------------------|
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS (utility-first design) |
| **Data Layer** | Jikan REST API (MyAnimeList) |
| **Icons** | Lucide React |
| **State & Fetching** | Custom hooks with React Query pattern |
| **Local Storage** | Custom `storageManager` |
| **Animation** | Tailwind transitions + keyframes |
| **Performance** | React.lazy + Suspense + memoization |

---

## 📁 Folder Structure

```

src/
├── components/
│   ├── AppHome.jsx              # Main dashboard layout
│   ├── AnimeDetailsPanel.jsx    # Lazy-loaded anime detail modal
│   ├── RecommendationSection.jsx
│   └── AnimeReview/
│        └── AnimeReview.jsx
│
├── helperComponent/
│   ├── AnimeDetailCard.jsx
│   ├── EpisodeList.jsx
│   ├── Badge.jsx
│   └── PageLoader.jsx
│
├── queries/
│   ├── useAnimeSearch.js
│   ├── useStarredAnime.js
│   └── useWatchlistAnime.js
│
├── utils/
│   ├── storageManager.js
│   └── utils.js
│
├── index.js
└── App.jsx

````

---

## ⚙️ Installation

```bash
# Clone the repo
git clone https://github.com/chouhan-abhi/AnimeSkdool.git

cd AnimeSkdool

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
````

> ⚠️ **Note:** Ensure the [Jikan API](https://docs.api.jikan.moe/) is reachable — it’s a public anime data API based on MyAnimeList.

---

## 🌗 Theme Support

* Material-inspired **Dark & Light themes**
* Auto-adaptive colors with CSS variables
* Elegant contrast and typography for better readability

---

## 📱 Responsive Behavior

| Screen Size         | Behavior                                                 |
| ------------------- | -------------------------------------------------------- |
| **Desktop**         | Sidebar filters & reviews visible inline                 |
| **Tablet / Mobile** | Filters hidden behind hamburger menu                     |
| **Anime Details**   | Opens from bottom half of the screen, swipe-up to expand |

---

## 🚀 Performance Optimizations

* ✅ **Lazy Loading:** Heavy sections (`AnimeReview`, `RecommendationSection`, `AnimeDetailsPanel`) load on demand
* ✅ **React Suspense:** Graceful fallbacks using `<PageLoader />`
* ✅ **Local Caching:** Data cached for quick revisit
* ✅ **Optimized Images:** Lazy-loaded, GPU-accelerated transitions

---

## 🪄 Roadmap

* [ ] 🎞️ Infinite scroll for search results
* [ ] ☁️ Cloud sync for watchlist & starred items
* [ ] 🌗 Theme toggle (Light / Dark switch)
* [ ] 💬 User reviews & ratings
* [ ] 📱 PWA support for offline use

---

## 🧑‍💻 Contributing

Contributions are always welcome!
Whether it’s improving performance, polishing the UI, or adding features — feel free to open an issue or PR.

```bash
# Fork the project
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add amazing feature"

# Push and open a Pull Request
git push origin feature/amazing-feature
```

---

## 📜 License

This project is licensed under the **MIT License**.
You’re free to use, modify, and distribute it — attribution appreciated 🌟

---

## ❤️ Credits

**Made with passion by [Abhishek Chouhan](https://github.com/chouhan-abhi)**
Powered by the anime community & the Jikan API.

---

```

---

Would you like me to make it **GitHub-pro ready** with dynamic badges (e.g., `last commit`, `stars`, `repo size`) and a **demo section** for your deployed site (Netlify/Vercel link)?
```
