import React, { useState, useEffect } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import RecommendationCard from "../helperComponent/RecommendationCard";

const RecommendationSection = () => {
  const [animeQueue, setAnimeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animate, setAnimate] = useState("opacity-0 translate-y-3");

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
    <div className="p-4 m-4 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-3 text-[var(--primary-color)]">
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
