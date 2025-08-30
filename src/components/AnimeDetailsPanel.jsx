import React, { useState, useEffect } from "react";
import EpisodesList from "./EpisodeList";
import { contentProvider, formatNumber } from "./utils";
import { Badge } from "./HelperComponents";
import { Bookmark } from "lucide-react";

const WATCHLIST_KEY = "watchlist";

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const {
    mal_id,
    title,
    title_english,
    title_japanese,
    images,
    episodes,
    score,
    scored_by,
    rank,
    popularity,
    members,
    favorites,
    studios,
    producers,
    genres,
    trailer,
    url,
    status,
    aired,
    broadcast,
  } = anime;

  const isUpcoming = (() => {
    const dateString = aired?.from || broadcast?.start_time;
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  })();

  const transparentPanel = "p-2 rounded-lg bg-black/30 backdrop-blur";

  // Watchlist state
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    setIsInWatchlist(saved.some((item) => item.mal_id === mal_id));
  }, [mal_id]);

  const toggleWatchlist = () => {
    const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    if (isInWatchlist) {
      const updated = saved.filter((item) => item.mal_id !== mal_id);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      setIsInWatchlist(false);
    } else {
      saved.push({
        mal_id,
        title,
        title_english,
        status,
        airDate: aired?.from || broadcast?.start_time,
        isKids: anime.isKids || false,
        isSFW: anime.isSFW !== false,
        isBookmarked: true,
      });
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(saved));
      setIsInWatchlist(true);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex justify-end">
      <div
        className="relative h-full w-full max-w-[700px] bg-surface text-foreground animate-slideIn"
        style={{
          backgroundImage: `url(${images?.jpg?.large_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent h-full w-full overflow-y-auto">
          {/* Close Button */}
          <div className="fixed right-4 top-4 flex justify-end">
            <button
              className="flex justify-center items-center w-10 h-10 cursor-pointer z-10 p-2 rounded-full hover:bg-white/20 transition"
              onClick={onClose}
              style={{ backdropFilter: "blur(4px)", fontSize: "x-large" }}
            >
              ×
            </button>
          </div>

          <div className="p-6 mt-80 z-10">
            {/* Titles with Bookmark */}
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold">{title}</h2>
              <button
                onClick={toggleWatchlist}
                className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-white/20 transition"
                style={{ backdropFilter: "blur(4px)" }}
              >
                <Bookmark className={`text-white ${isInWatchlist ? "bg-[var(--primary-color)] rounded-full p-[4px]" : ""}`} />
              </button>
            </div>

            {title_english && <p className="text-sm italic mb-1">{title_english}</p>}
            {title_japanese && <p className="text-sm italic mb-2">{title_japanese}</p>}

            {/* Status + Stats */}
            <div className="flex flex-wrap gap-3 my-4">
              {isUpcoming ? (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  ⏳ Upcoming
                </span>
              ) : status ? (
                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  📺 {status}
                </span>
              ) : null}

              {score && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  ⭐ {score} <span className="text-xs">({scored_by || 0} users)</span>
                </span>
              )}

              {rank && (
                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                  Rank #{rank}
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-4 gap-3 rounded-lg mb-6`}>
              {[
                { label: "Popularity", value: `#${popularity}` },
                { label: "Members", value: formatNumber(members) },
                { label: "Favorites", value: formatNumber(favorites) },
                { label: "Episodes", value: episodes || "TBA" },
              ].map((stat) => (
                <div key={stat.label} className={`${transparentPanel} text-center`}>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Synopsis */}
            <p className="mb-4">{anime.synopsis || "No synopsis available."}</p>

            <EpisodesList animeId={mal_id} />

            {/* Genres */}
            {genres?.length > 0 && (
              <div className={`${transparentPanel} mb-6`}>
                <h4 className="font-semibold text-lg mb-2">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Badge key={g.mal_id} className="cursor-pointer hover:bg-gray-600">
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Studios & Producers */}
            {[
              { title: "Studios", data: studios },
              { title: "Producers", data: producers },
            ].map(
              (section) =>
                section.data?.length > 0 && (
                  <div key={section.title} className={`${transparentPanel} mb-6`}>
                    <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {section.data.map((item) => (
                        <a
                          key={item.mal_id}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-gray-600 text-center p-3 rounded-lg transition hover:bg-gray-600"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )
            )}

            {/* Trailer */}
            {trailer?.embed_url && (
              <div className={`my-6 ${transparentPanel}`}>
                <h4 className="font-semibold text-lg mb-2">Trailer</h4>
                <iframe
                  src={`${trailer.embed_url}&mute=1`}
                  title="Anime Trailer"
                  width="100%"
                  height="315"
                  allow="encrypted-media"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Watch It On */}
            <div className={`${transparentPanel} mb-6`}>
              <h4 className="font-semibold text-lg mb-2">Watch it on</h4>
              <div className="grid grid-cols-2 gap-3">
                {contentProvider.map((provider) => (
                  <a
                    key={provider.name}
                    href={`${provider.url}${encodeURIComponent(title_english)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-gray-600 text-center p-3 rounded-lg transition hover:bg-gray-600"
                  >
                    <span className="mr-2">▶</span>
                    {provider.name}
                  </a>
                ))}
              </div>
            </div>

            {/* MAL Link */}
            {url && (
              <div className="mt-4 flex justify-end">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium mr-4 border border-gray-600 rounded-lg transition hover:bg-gray-600 px-4 py-2"
                  style={{ color: "var(--primary-color)" }}
                >
                  View on MAL →
                </a>
              </div>
            )}
          </div>
        </div>

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
    </div>
  );
};

export default AnimeDetailsPanel;
