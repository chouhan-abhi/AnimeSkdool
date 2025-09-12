import React from "react";

const RecommendationCard = ({ anime, onOpen, animateClasses }) => {
  const handleClick = () => {
    onOpen(anime);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full max-w-5xl h-[520px] md:h-[520px] 
        rounded-2xl shadow-3xl overflow-hidden cursor-pointer select-none 
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

export default RecommendationCard;