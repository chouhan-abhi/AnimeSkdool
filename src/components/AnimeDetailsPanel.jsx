import React from "react";

const contentProvider = [
    {
        url: 'https://anikoto.tv/filter?keyword=',
        name: 'Anikoto'
    }, {
        url: 'https://9anime.org.lv/?s=',
        name: '9Anime',
    }
];

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
        status,
        airing
    } = anime;

    const Badge = ({ children, className = "" }) => (
        <span className={`bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs ${className}`}>
            {children}
        </span>
    );

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex justify-end">
            <div
                className="relative h-full w-full max-w-[700px] bg-[#1e1e1e] text-white animate-slideIn"
                style={{
                    backgroundImage: `url(${images?.jpg?.large_image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent h-full w-full overflow-y-auto">
                    {/* Close Button */}
                    <div className="fixed right-4 top-4 bg-transparent flex justify-end">
                        <button
                            className="flex justify-center cursor-pointer aspect-square z-9 p-2 rounded-full hover:bg-white/20 transition"
                            onClick={onClose}
                            style={{ backdropFilter: "blur(4px)", fontSize: 'x-large' }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 mt-80 z-10">
                        {/* Title Section */}
                        <h2 className="text-3xl font-bold mb-1">{title}</h2>
                        {title_english && <p className="text-sm italic mb-1">{title_english}</p>}
                        {title_japanese && <p className="text-sm italic mb-2">{title_japanese}</p>}
                        <div className="flex flex-wrap gap-3 my-4">
                            {airing && (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                                    ✅ Currently Airing
                                </span>
                            )}
                            {score && (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                                    ⭐ {score} <span className="text-xs">({scored_by || 0} users)</span>
                                </span>
                            )}
                            {rank && (
                                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold mb-2 inline-block">
                                    Rank #{rank}
                                </span>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-3 rounded-lg mb-6">
                            <div className="text-center border border-gray-600 p-3 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <p className="text-xs text-gray-400">Popularity</p>
                                <p className="font-semibold">#{popularity}</p>
                            </div>
                            <div className="text-center border border-gray-600 p-3 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <p className="text-xs text-gray-400">Members</p>
                                <p className="font-semibold">{members?.toLocaleString()}</p>
                            </div>
                            <div className="text-center border border-gray-600 p-3 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <p className="text-xs text-gray-400">Favorites</p>
                                <p className="font-semibold">{favorites}</p>
                            </div>
                            <div className="text-center border border-gray-600 p-3 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <p className="text-xs text-gray-400">Episodes</p>
                                <p className="font-semibold">{episodes || "TBA"}</p>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <p className="mb-4">{synopsis || "No synopsis available."}</p>

                        {/* Season & Schedule Section */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-lg mb-2">Season & Schedule</h4>
                            <p className="text-sm">Season: {season} {year}</p>
                            <p className="text-sm">Broadcast: {broadcast?.string || "Unknown"}</p>
                            <p className="text-sm">Rating: {rating || "N/A"}</p>
                            <p className="text-sm">Duration: {duration}</p>
                        </div>

                        {/* Genres */}
                        {genres?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-lg mb-2">Genres</h4>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((g) => (
                                        <Badge key={g.mal_id} className="cursor-pointer hover:bg-gray-600">{g.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Studios */}
                        {studios?.length > 0 && (
                            <div className="mb-6 p-2 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <h4 className="font-semibold text-lg mb-2">Studio</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {studios.map((studio) => (
                                        <a
                                            key={studio.mal_id}
                                            href={studio.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="border border-gray-600 text-center p-3 rounded-lg transition hover:bg-gray-600"
                                        >
                                            {studio.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {producers?.length > 0 && (
                            <div className="mb-6 p-2 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
                                <h4 className="font-semibold text-lg mb-2">Producers</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {producers.map((producer) => (
                                        <a
                                            key={producer.mal_id}
                                            href={producer.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="border border-gray-600 text-center p-3 rounded-lg transition hover:bg-gray-600"
                                        >
                                            {producer.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {trailer?.embed_url && (
                            <div className="my-6">
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

                        <div className="mb-6 p-2 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
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
                                        <span className="mr-2">▶</span>{provider.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            {url && (
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline font-medium mr-4 bg-black/2 border border-gray-600 rounded-lg transition hover:bg-gray-600 px-4 py-2" style={{ backdropFilter: "blur(4px)" }}
                                >
                                    View on MAL →
                                </a>
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
