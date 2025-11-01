import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import EpisodesList from "../helperComponent/EpisodeList";
import { contentProvider, formatNumber } from "../utils/utils";
import { Badge } from "../helperComponent/Badge";
import { Bookmark } from "lucide-react";

const WATCHLIST_KEY = "watchlist";

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const root = document.getElementById("modal-root");
    setPortalRoot(root);

    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    setIsInWatchlist(saved.some((item) => item.mal_id === anime.mal_id));

    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [anime.mal_id]);

  const handleEscClose = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [handleEscClose]);

  const toggleWatchlist = () => {
    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    if (isInWatchlist) {
      const updated = saved.filter((item) => item.mal_id !== anime.mal_id);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      setIsInWatchlist(false);
    } else {
      saved.push({ ...anime, isBookmarked: true });
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(saved));
      setIsInWatchlist(true);
    }
  };

  if (!portalRoot) return null;

  const transparentPanel = "p-2 rounded-lg bg-black/40";

  const renderDetails = () => (
    <div className="overflow-y-auto h-full space-y-6">
      {/* Titles + Bookmark */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-4xl font-bold">{anime.title}</h2>
        <button
          onClick={toggleWatchlist}
          className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-white/20 transition"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <Bookmark
            size={32}
            className={`rounded-full p-[4px] ${
              isInWatchlist
                ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                : "text-white"
            }`}
          />
        </button>
      </div>

      {anime.title_english && (
        <p className="text-sm italic">{anime.title_english}</p>
      )}
      {anime.title_japanese && (
        <p className="text-sm italic">{anime.title_japanese}</p>
      )}

      {/* Status + Stats */}
      <div className="flex flex-wrap gap-3 my-4">
        {anime.status && (
          <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold">
            📺 {anime.status}
          </span>
        )}
        {anime.score && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ⭐ {anime.score}{" "}
            <span className="text-xs">({anime.scored_by || 0} users)</span>
          </span>
        )}
        {anime.rank && (
          <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold">
            Rank #{anime.rank}
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 rounded-lg mb-6">
        {[
          { label: "Popularity", value: `#${anime.popularity}` },
          { label: "Members", value: formatNumber(anime.members) },
          { label: "Favorites", value: formatNumber(anime.favorites) },
          { label: "Episodes", value: anime.episodes || "TBA" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${transparentPanel} text-center`}
            style={{ backdropFilter: "blur(4px)" }}
          >
            <p className="text-xs">{stat.label}</p>
            <p className="font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="mb-4 leading-relaxed">
        {anime.synopsis || "No synopsis available."}
      </p>

      <EpisodesList animeId={anime.mal_id} />

      <div
        className={`${transparentPanel} mb-6 p-4`}
        style={{ backdropFilter: "blur(4px)" }}
      >
        {anime.genres?.length > 0 && (
          <>
            <h4 className="font-semibold text-lg mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((g) => (
                <Badge key={g.mal_id}>{g.name}</Badge>
              ))}
            </div>
          </>
        )}

        {[{ title: "Studios", data: anime.studios }, { title: "Producers", data: anime.producers }].map(
          (section) =>
            section.data?.length > 0 && (
              <div key={section.title} className="mb-6">
                <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
                <div className="flex flex-wrap gap-3">
                  {section.data.map((item) => (
                    <a
                      key={item.mal_id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-gray-600 text-center px-4 py-2 rounded-lg transition hover:bg-[var(--primary-color)]"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            )
        )}

        {anime.trailer?.embed_url && (
          <>
            <h4 className="font-semibold text-lg mb-2">Trailer</h4>
            <iframe
              src={`${anime.trailer.embed_url}&mute=1`}
              title="Anime Trailer"
              width="100%"
              height="315"
              allow="encrypted-media"
              allowFullScreen
              className="rounded-lg mb-6"
            />
          </>
        )}

        <h4 className="font-semibold text-lg mb-2">Watch it on</h4>
        <div className="flex flex-wrap gap-3 mb-6">
          {contentProvider.map((provider) => (
            <a
              key={provider.name}
              href={`${provider.url}${encodeURIComponent(
                anime.title_english || anime.title || anime.title_japanese
              )}`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-600 text-center px-4 py-2 rounded-lg transition hover:bg-[var(--primary-color)]"
            >
              {provider.name}
            </a>
          ))}
        </div>
      </div>

      {anime.url && (
        <div className="mt-4 flex justify-end">
          <a
            href={anime.url}
            target="_blank"
            rel="noreferrer"
            className="underline font-medium mr-4 border border-gray-600 rounded-lg transition hover:bg-[var(--primary-color)] px-4 py-2"
            style={{ color: "var(--primary-color)" }}
          >
            View on MAL →
          </a>
        </div>
      )}
    </div>
  );

  const handleBackdropClick = (e) => {
    if (isLargeScreen && e.target.id === "anime-details-backdrop") {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      id="anime-details-backdrop"
      className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[9999] flex flex-col lg:flex-row overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        className="absolute right-6 top-6 w-14 h-14 flex justify-center items-center cursor-pointer z-50 p-3 bg-black/40 rounded-full hover:bg-white/20 transition text-4xl font-light"
        onClick={onClose}
        style={{ backdropFilter: "blur(6px)" }}
      >
        ×
      </button>

      {/* Background Image */}
      <div
        className={`relative ${
          isLargeScreen ? "w-[68%] h-full order-2" : "w-full h-[50vh] order-1"
        } overflow-hidden`}
      >
        <img
          src={anime.images?.jpg?.large_image_url}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover object-center scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/50 to-black/90"></div>
      </div>

      {/* Details Panel */}
      <div
        className={`relative z-10 text-white overflow-y-auto animate-slideIn ${
          isLargeScreen
            ? "w-[40%] max-w-[640px] p-10 bg-transparent backdrop-blur-2xl order-1"
            : "w-full bg-black/85 p-6 order-2"
        }`}
      >
        {renderDetails()}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slideIn {
            animation: slideIn 0.4s ease-out forwards;
          }
        `}
      </style>
    </div>,
    portalRoot
  );
};

export default AnimeDetailsPanel;
