import React, { useState } from "react";
import PageLoader from "./PageLoader";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import { formatNumber } from "./utils";
import UpcomingAnimeList from "./UpcomingAnimeList";
import { useAnimeRanking } from "../queries/useAnimeRanking";

const AnimeRanking = () => {
  const [viewMode, setViewMode] = useState("upcoming"); // upcoming | ranking
  const [type, setType] = useState("");
  const [filter, setFilter] = useState("bypopularity");
  const [rating, setRating] = useState("");
  const [sfw, setSfw] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const { data: rankingData, isLoading: loadingRanking, error: errorRanking } =
    useAnimeRanking(
      viewMode === "ranking"
        ? { type, filter, rating, sfw, page }
        : undefined
    );

  const loading = viewMode === "ranking" ? loadingRanking : false;
  const error = viewMode === "ranking" ? errorRanking : null;
  const animeList = viewMode === "ranking" ? rankingData?.data || [] : [];
  const pagination = viewMode === "ranking" ? rankingData?.pagination || {} : {};

  const nextPage = () => {
    if (pagination?.has_next_page) setPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <div className="flex min-h-screen text-[var(--text-color)] bg-[var(--bg-color)]">
      {/* Sidebar */}
      <aside className="w-72 p-4 bg-[var(--bg-color)] hidden md:block">
        <h2 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">
          Filters
        </h2>

        <div className="flex flex-col gap-2 mb-4">
          <button
            className={`py-2 rounded font-medium transition ${
              viewMode === "upcoming"
                ? "bg-[var(--primary-color)] text-[var(--bg-color)]"
                : "bg-[var(--secondary-color)] text-[var(--text-color)]"
            }`}
            onClick={() => setViewMode("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`py-2 rounded font-medium transition ${
              viewMode === "ranking"
                ? "bg-[var(--primary-color)] text-[var(--bg-color)]"
                : "bg-[var(--secondary-color)] text-[var(--text-color)]"
            }`}
            onClick={() => { setViewMode("ranking"); setPage(1); }}
          >
            Ranking
          </button>
        </div>

        {viewMode === "ranking" && (
          <div className="flex flex-col gap-2">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full p-2 rounded bg-[var(--secondary-color)] border border-[var(--border-color)] text-sm"
            >
              <option value="">All Types</option>
              <option value="tv">TV</option>
              <option value="movie">Movie</option>
              <option value="ova">OVA</option>
              <option value="special">Special</option>
              <option value="ona">ONA</option>
              <option value="music">Music</option>
            </select>

            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="w-full p-2 rounded bg-[var(--secondary-color)] border border-[var(--border-color)] text-sm"
            >
              <option value="airing">Airing</option>
              <option value="upcoming">Upcoming</option>
              <option value="bypopularity">By Popularity</option>
              <option value="favorite">Favorites</option>
            </select>

            <select
              value={rating}
              onChange={(e) => { setRating(e.target.value); setPage(1); }}
              className="w-full p-2 rounded bg-[var(--secondary-color)] border border-[var(--border-color)] text-sm"
            >
              <option value="">All Ratings</option>
              <option value="g">G - All Ages</option>
              <option value="pg">PG - Children</option>
              <option value="pg13">PG-13</option>
              <option value="r17">R - 17+</option>
              <option value="r">R+ - Mild Nudity</option>
              <option value="rx">Rx - Hentai</option>
            </select>

            <button
              onClick={() => setSfw((prev) => !prev)}
              className={`w-full py-2 mt-2 rounded font-medium ${
                sfw
                  ? "bg-[var(--accent-color)] text-[var(--bg-color)]"
                  : "bg-[var(--secondary-color)] text-[var(--text-color)]"
              }`}
            >
              {sfw ? "SFW: ON" : "SFW: OFF"}
            </button>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="py-1 px-3 rounded bg-[var(--secondary-color)] text-[var(--text-color)] disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">{page} / {pagination?.last_visible_page || 1}</span>
              <button
                onClick={nextPage}
                disabled={!pagination?.has_next_page}
                className="py-1 px-3 rounded bg-[var(--secondary-color)] text-[var(--text-color)] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {viewMode === "upcoming" ? (
          <UpcomingAnimeList onSelectAnime={setSelectedAnime} />
        ) : loading ? (
          <PageLoader />
        ) : error ? (
          <p className="text-red-500">{error.message || error}</p>
        ) : animeList.length === 0 ? (
          <p className="text-gray-400">No anime found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {animeList.map((anime) => (
              <div
                key={anime.mal_id}
                className="relative rounded-md overflow-hidden cursor-pointer group bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] transition"
                onClick={() => setSelectedAnime(anime)}
              >
                <img
                  src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || "/placeholder.jpg"}
                  alt={anime.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-base font-semibold truncate">{anime.title}</h3>
                  <p className="text-xs mt-1 text-[var(--text-color)]">
                    ⭐ {anime.score || "N/A"} | Rank #{anime.rank || "?"} | {anime.type} | Members: {formatNumber(anime.members)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedAnime && (
        <AnimeDetailsPanel
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};

export default AnimeRanking;
