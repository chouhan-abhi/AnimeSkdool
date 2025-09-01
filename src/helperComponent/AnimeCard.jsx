import React, { useState } from "react";
import AnimeDetailsPanel from "../components/AnimeDetailsPanel";

const AnimeCard = ({ anime }) => {
  const [expanded, setExpanded] = useState(false);

  if (!anime) return null;

  const {
    title,
    images,
    type,
    episodes,
    duration,
    score,
    rank,
    status,
    year,
    season,
    rating,
    studios,
    genres,
    trailer,
    popularity,
    members,
    producers,
  } = anime;

  return (
    <>
      <div
        className="relative h-[320px] w-full rounded-xl bg-cover bg-center overflow-hidden shadow-lg flex items-end cursor-pointer text-white"
        style={{ backgroundImage: `url(${images?.jpg?.image_url})` }}
        onClick={() => setExpanded(true)}
      >
        <div className="bg-gradient-to-t from-black/85 to-black/10 w-full p-4 flex flex-col justify-between">
          {/* Title & Basic Info */}
          <div className="flex flex-col max-h-[120px] overflow-hidden">
            <h3 className="text-lg font-semibold m-0 truncate">{title}</h3>
            <p className="text-sm text-gray-300 truncate">
              {type} • {duration} • {episodes ?? "TBA"} eps
            </p>
            <p className="text-xs text-gray-400 truncate">
              {status} {year ? `• ${season} ${year}` : ""}
            </p>
            <p className="text-xs text-gray-400 truncate">{rating}</p>
          </div>

          {/* Studios */}
          {studios?.length > 0 && (
            <p className="text-xs mt-2 truncate text-gray-300">
              Studio: {studios.map((s) => s.name).join(", ")}
            </p>
          )}

          {/* Genres */}
          {genres?.length > 0 && (
            <p className="text-xs truncate text-gray-300">
              Genres: {genres.map((g) => g.name).join(", ")}
            </p>
          )}

          {/* Producers */}
          {producers?.length > 0 && (
            <p className="text-xs truncate text-gray-300">
              Producer: {producers.map((p) => p.name).join(", ")}
            </p>
          )}

          {/* Popularity */}
          {popularity && members && (
            <p className="text-xs truncate text-gray-300">
              Popularity: #{popularity} • {members.toLocaleString()} members
            </p>
          )}
        </div>

        {/* Score & Rank Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 ">
          {(score || rank) && (
            <span
              style={{ backdropFilter: "blur(4px)" }}
              className="font-bold text-sm px-3 py-1 rounded-full bg-black/50 shadow-lg"
            >
              {score ? "⭐" + score : ""} {rank ? "#" + rank : ""}
            </span>
          )}
        </div>

        {/* Trailer Preview Badge */}
        {trailer?.images?.medium_image_url && (
          <div className="absolute top-2 right-2">
            <img
              src={trailer.images.medium_image_url}
              alt="Trailer thumbnail"
              className="w-16 h-10 object-cover rounded-md shadow-md border border-white/30"
            />
          </div>
        )}
      </div>

      {/* Expanded Details Panel */}
      {expanded && (
        <AnimeDetailsPanel anime={anime} onClose={() => setExpanded(false)} />
      )}
    </>
  );
};

export default AnimeCard;
