import React from "react";

const AnimeDetailsPanel = ({ anime, onClose }) => {
    const {
        title,
        title_english,
        title_japanese,
        images,
        type,
        episodes,
        rating,
        duration,
        score,
        scored_by,
        rank,
        popularity,
        members,
        favorites,
        broadcast,
        synopsis,
        studios,
        producers,
        genres,
        year,
        season,
        trailer,
        url,
    } = anime;

    const Badge = ({ children, className = "" }) => (
        <span className={`bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs mr-2 ${className}`}>
            {children}
        </span>
    );

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex justify-end">
            <div
                className="relative h-full w-full max-w-[700px] bg-[#1e1e1e] text-white overflow-y-auto animate-slideIn"
                style={{
                    backgroundImage: `url(${images?.jpg?.large_image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    {/* Close Button */}
                    <div className="fixed right-4 top-4 text-3xl bg-transparent flex justify-end">
                        <button
                            className="cursor-pointer aspect-square z-9 rounded-full h-5 w-5 hover:bg-white/20 transition"
                            onClick={onClose}
                            style={{ backdropFilter: 'blur(4px)' }}
                        >
                            ×
                        </button>
                    </div>

                    <div className="inset-0 p-6 z-[99999] text-base leading-relaxed mt-80 text-white z-10">
                        <div className="p-6 rounded-lg mb-8">
                            <h2 className="text-3xl font-bold mb-1">{title}</h2>
                            {title_english && <p className="text-sm italic mb-1">{title_english}</p>}
                            {title_japanese && <p className="text-sm italic mb-2">{title_japanese}</p>}
                            <div className="flex items-center gap-2 my-2">
                                {score && (
                                    <span className="bg-yellow-500 text-black font-semibold px-2 py-1 rounded-full shadow-md">
                                        ⭐ {score} <span className="text-xs text-gray-800">({scored_by || 0} users)</span>
                                    </span>
                                )}
                                {rank && (
                                    <span className="bg-indigo-600 text-white font-semibold px-2 py-1 rounded-full shadow-md">
                                        #{rank}
                                    </span>
                                )}
                            </div>

                            {/* Basic Info */}
                            <p className="text-sm mb-2">
                                {type} | {episodes || "TBA"} episodes | {duration}
                            </p>

                            {/* Genre & Studios */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                {genres?.map((g) => (
                                    <Badge key={g.mal_id}>{g.name}</Badge>
                                ))}
                                {studios?.map((s) => (
                                    <Badge key={s.mal_id} className="bg-purple-700">{s.name}</Badge>
                                ))}
                            </div>

                            {/* Synopsis */}
                            <p className="mb-4">{synopsis || "No synopsis available."}</p>

                            {/* Extended Info */}
                            <div className="text-sm space-y-1 mb-4">
                                <p>Season: {season} {year}</p>
                                <p>Broadcast: {broadcast?.string || "Unknown"}</p>
                                <p>Rating: {rating || "N/A"}</p>
                                <p>Popularity: #{popularity || "N/A"} | Members: {members?.toLocaleString() || 0} | Favorites: {favorites || 0}</p>
                            </div>

                            {/* Producers */}
                            {producers?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className=" font-semibold mb-1">Producers:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {producers.map((p) => (
                                            <Badge key={p.mal_id} className="bg-blue-700">{p.name}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* External Links */}
                            <div className="mt-4">
                                {url && (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sky-400 underline font-medium mr-4"
                                    >
                                        View on MAL →
                                    </a>
                                )}
                            </div>

                            {/* Trailer */}
                            {trailer?.embed_url && (
                                <div className="my-4">
                                    <iframe
                                        src={trailer.embed_url}
                                        title="Anime Trailer"
                                        width="100%"
                                        height="315"
                                        allow="encrypted-media"
                                        allowFullScreen
                                        className="rounded-lg shadow-lg"
                                    />
                                </div>
                            )}
                        </div>
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
