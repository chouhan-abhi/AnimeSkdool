import React, { useState, useEffect } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";

const RecommendationCard = ({ anime, onOpen, animateClasses }) => {
  const handleClick = () => {
    onOpen(anime);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full max-w-5xl h-[380px] md:h-[480px] 
        rounded-2xl shadow-xl overflow-hidden cursor-pointer select-none 
        transform transition-transform duration-500 ease-out ${animateClasses}`}
    >
      {/* Poster full background */}
      <img
        src={
          anime.images?.webp?.large_image_url ||
          anime.images?.jpg?.large_image_url
        }
        alt={anime.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Details */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-white">
        <h2 className="text-xl md:text-3xl font-bold leading-tight line-clamp-2">
          {anime.title}
        </h2>
        {anime.title_english && anime.title_english !== anime.title && (
          <p className="text-sm text-gray-300 line-clamp-1">
            {anime.title_english}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mt-2">
          {anime.type && (
            <span className="px-2 py-1 bg-indigo-600/90 rounded text-xs">
              {anime.type}
            </span>
          )}
          {anime.year && (
            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
              {anime.year}
            </span>
          )}
          {anime.episodes && (
            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
              {anime.episodes} eps
            </span>
          )}
          {typeof anime.score === "number" && (
            <span className="px-2 py-1 bg-yellow-400 text-black rounded text-xs">
              ⭐ {anime.score}
            </span>
          )}
        </div>

        {/* Synopsis (shortened) */}
        <p className="text-xs md:text-sm text-gray-200/90 mt-2 line-clamp-3">
          {anime.synopsis || "No description available."}
        </p>
      </div>
    </div>
  );
};

const RecommendationSection = () => {
  const [animeQueue, setAnimeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animate, setAnimate] = useState("opacity-0 translate-y-6");

  // Fetch random anime
  const fetchRandomAnime = async () => {
    try {
      const res = await fetch("https://api.jikan.moe/v4/random/anime");
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error("Error fetching anime:", err);
      return null;
    }
  };

  // Load initial 2 anime into queue
  useEffect(() => {
    const loadInitial = async () => {
      const first = await fetchRandomAnime();
      const second = await fetchRandomAnime();
      const arr = [first, second].filter(Boolean);
      setAnimeQueue(arr);
      setCurrentIndex(0);

      if (arr.length > 0) {
        requestAnimationFrame(() =>
          setAnimate("opacity-100 translate-y-0 transition-transform duration-500")
        );
      }
    };
    loadInitial();
  }, []);

  // Handle animation direction
  const runEnterAnimation = (dir) => {
    if (dir === "left") {
      setAnimate("-translate-x-[120%] opacity-0");
      requestAnimationFrame(() =>
        setAnimate("translate-x-0 opacity-100 transition-transform duration-500")
      );
    } else if (dir === "right") {
      setAnimate("translate-x-[120%] opacity-0");
      requestAnimationFrame(() =>
        setAnimate("translate-x-0 opacity-100 transition-transform duration-500")
      );
    } else {
      setAnimate("opacity-0 translate-y-6");
      requestAnimationFrame(() =>
        setAnimate("opacity-100 translate-y-0 transition-transform duration-500")
      );
    }
  };

  const navigateRight = async () => {
    if (currentIndex < animeQueue.length - 1) {
      setCurrentIndex((i) => i + 1);
      runEnterAnimation("right");
    } else {
      const newAnime = await fetchRandomAnime();
      if (newAnime) {
        setAnimeQueue((prev) => [...prev, newAnime]);
        setCurrentIndex((i) => i + 1);
      }
      runEnterAnimation("right");
    }

    setAnimeQueue((prev) => (prev.length > 10 ? prev.slice(-10) : prev));
  };

  const navigateLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      runEnterAnimation("left");
    }
  };

  const currentAnime = animeQueue[currentIndex];

  return (
    <div className="p-4 m-4 w-full flex flex-col items-center">
      <h2 className="text-lg font-semibold text-indigo-400 mb-3">
        Recommended Anime
      </h2>

      <div className="relative flex items-center justify-center w-full">
        {/* Left Button */}
        <button
          onClick={navigateLeft}
          className=" md:flex absolute left-0 z-10  w-12 h-12 flex items-center justify-center 
             rounded-full 
             bg-gray-800/20 hover:bg-gray-700/70 
             backdrop-blur-sm transition"
        >
          ◀
        </button>

        {/* Anime Card */}
        {currentAnime ? (
          <RecommendationCard
            key={currentAnime.mal_id}
            anime={currentAnime}
            onOpen={setSelectedAnime}
            animateClasses={animate}
          />
        ) : (
          <div className="w-full max-w-5xl h-[380px] md:h-[480px] rounded-2xl bg-gray-800/70 animate-pulse" />
        )}

        {/* Right Button */}
        <button
          onClick={navigateRight}
          className="md:flex absolute right-2 z-10 
             w-12 h-12 flex items-center justify-center 
             rounded-full 
             bg-gray-800/20 hover:bg-gray-700/70 
             backdrop-blur-sm transition"
        >
          ▶
        </button>

      </div>

      {/* Details Panel */}
      {selectedAnime && (
        <AnimeDetailsPanel
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};
export default RecommendationSection;
