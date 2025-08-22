import React, { useEffect, useState, useMemo } from "react";
import PageLoader from "./PageLoader";
import { useAnimeRanking } from "../queries/useAnimeRank";

const AnimeRanking = () => {
  const [type, setType] = useState("");
  const [filter, setFilter] = useState("bypopularity");
  const [rating, setRating] = useState("");
  const [sfw, setSfw] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const queryParams = useMemo(
    () => ({
      type,
      filter,
      rating,
      sfw,
      page,
    }),
    [type, filter, rating, sfw, page]
  );

  // Fetch rankings
  const response =
    useAnimeRanking(new URLSearchParams(queryParams).toString());
  const { data: animeList = [], loading, pagination } = response?.data || {};
console.log({animeList, pagination})
  const nextPage = () => {
    if (pagination?.has_next_page) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="bg-gray-950 p-4 rounded-lg text-white">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-indigo-400">Anime Rankings</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="">All Types</option>
            <option value="tv">TV</option>
            <option value="movie">Movie</option>
            <option value="ova">OVA</option>
            <option value="special">Special</option>
            <option value="ona">ONA</option>
            <option value="music">Music</option>
          </select>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="airing">Airing</option>
            <option value="upcoming">Upcoming</option>
            <option value="bypopularity">By Popularity</option>
            <option value="favorite">Favorites</option>
          </select>

          {/* Rating */}
          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="">All Ratings</option>
            <option value="g">G - All Ages</option>
            <option value="pg">PG - Children</option>
            <option value="pg13">PG-13</option>
            <option value="r17">R - 17+</option>
            <option value="r">R+ - Mild Nudity</option>
            <option value="rx">Rx - Hentai</option>
          </select>

          {/* Toggle SFW */}
          <button
            onClick={() => {
              setSfw((prev) => !prev);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-semibold rounded transition ${
              sfw
                ? "bg-green-500 text-black hover:bg-green-400"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {sfw ? "SFW: ON" : "SFW: OFF"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Rankings */}
      {loading ? (
        <PageLoader />
      ) : animeList?.length === 0 ? (
        <p className="text-center text-gray-400 py-6">
          No anime found for the selected filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {animeList?.map?.((anime) => (
              <div
                key={anime.mal_id}
                className="relative rounded-lg overflow-hidden h-52 group cursor-pointer shadow-lg hover:scale-[1.02] transition-transform"
              >
                <img
                  src={
                    anime.images?.webp?.large_image_url ||
                    anime.images?.jpg?.large_image_url ||
                    "/placeholder.jpg"
                  }
                  alt={anime.title || "Anime"}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                <div className="relative z-10 p-3 flex flex-col justify-end h-full text-white">
                  <span className="text-xs text-gray-300">
                    Rank #{anime.rank || "?"} | Score: {anime.score || "N/A"}
                  </span>
                  <span className="text-lg font-bold truncate">
                    {anime.title || "Unknown"}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    [Type: {type || "All"}] [Filter: {filter}] [Rating:{" "}
                    {rating || "All"}] [SFW: {sfw ? "Yes" : "No"}]
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              Prev
            </button>
            <span className="text-gray-300 text-sm">
              Page {page} of {pagination?.last_visible_page || 1}
            </span>
            <button
              onClick={nextPage}
              disabled={!pagination?.has_next_page}
              className={`px-4 py-2 rounded ${
                !pagination?.has_next_page
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimeRanking;
