import React, { useState } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";

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
    rank
  } = anime;

  return (
    <>
      <div
        className="relative h-[280px] w-full rounded-xl bg-cover bg-center overflow-hidden shadow-lg flex items-end cursor-pointer text-white"
        style={{ backgroundImage: `url(${images?.jpg?.large_image_url})` }}
        onClick={() => setExpanded(true)}
      >
        <div className="bg-gradient-to-t from-black/85 to-black/10 w-full p-4 flex flex-col justify-between">
          <div className="flex flex-col max-h-[90px] overflow-hidden">
            <h3 className="text-lg font-semibold m-0 truncate">{title}</h3>
            <p className="text-sm text-gray-300 truncate">
              {type} • {duration} • {episodes ?? "TBA"} eps
            </p>

          </div>
        </div>

        {/* Score & Rank Badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 ">
            {(score || rank) && (
              <span style={{ backdropFilter: 'blur(4px)' }} className="font-bold text-sm px-3 py-1 rounded-full bg-black/50 shadow-lg">
                {score ? '⭐' + score : ''} {rank ? '#' + rank : ''}
              </span>
            )}
          </div>
      </div>
      {expanded && (
        <AnimeDetailsPanel anime={anime} onClose={() => setExpanded(false)} />
      )}
    </>
  );
};

export default AnimeCard;
