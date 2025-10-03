import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import EpisodesList from "../helperComponent/EpisodeList";
import { contentProvider, formatNumber } from "../utils/utils";
import { Badge } from "../helperComponent/Badge";
import { Bookmark } from "lucide-react";

const WATCHLIST_KEY = "watchlist";

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
console.log('portalRoot', portalRoot)
  // Ensure portal exists after mount
  useEffect(() => {
    const root = document.getElementById("modal-root");
    setPortalRoot(root);

    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    setIsInWatchlist(saved.some((item) => item.mal_id === anime.mal_id));
  }, [anime.mal_id]);

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

  if (!portalRoot) return null; // wait until portal exists

  const transparentPanel = "p-2 rounded-lg bg-black/40";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex justify-end">
      <div
        className="relative h-full w-full max-w-[700px] bg-surface text-foreground animate-slideIn overflow-y-auto"
        style={{
          backgroundImage: `url(${anime.images?.jpg?.large_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent h-full w-full overflow-y-auto">
          {/* Close Button */}
          <button
            className="fixed right-4 top-4 w-10 h-10 flex justify-center items-center cursor-pointer z-50 p-2 bg-black/40 rounded-full hover:bg-white/20 transition"
            onClick={onClose}
            style={{ backdropFilter: "blur(6px)" }}
          >
            ×
          </button>

          <div className="p-6 mt-80">
            {/* Titles + Bookmark */}
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold">{anime.title}</h2>
              <button
                onClick={toggleWatchlist}
                className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-white/20 transition"
                style={{ backdropFilter: "blur(4px)" }}
              >
                <Bookmark
                  size={32}
                  className={`rounded-full p-[4px] text-xl ${
                    isInWatchlist
                      ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                      : "text-white"
                  }`}
                />
              </button>
            </div>

            {anime.title_english && (
              <p className="text-sm italic mb-1">{anime.title_english}</p>
            )}
            {anime.title_japanese && (
              <p className="text-sm italic mb-2">{anime.title_japanese}</p>
            )}

            {/* Status + Stats */}
            <div className="flex flex-wrap gap-3 my-4">
              {anime.status && (
                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  📺 {anime.status}
                </span>
              )}
              {anime.score && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  ⭐ {anime.score} <span className="text-xs">({anime.scored_by || 0} users)</span>
                </span>
              )}
              {anime.rank && (
                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
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

            {/* Synopsis */}
            <p className="mb-4">{anime.synopsis || "No synopsis available."}</p>

            <EpisodesList animeId={anime.mal_id} />

            {/* Genres, Studios, Producers */}
            <div className={`${transparentPanel} mb-6`} style={{ backdropFilter: "blur(4px)" }}>
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

              {/* Trailer */}
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

              {/* Watch It On */}
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

            {/* MAL Link */}
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
        </div>

        {/* Slide In Animation */}
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slideIn {
              animation: slideIn 0.3s ease-out forwards;
            }
          `}
        </style>
      </div>
    </div>,
    portalRoot
  );
};

export default AnimeDetailsPanel;
