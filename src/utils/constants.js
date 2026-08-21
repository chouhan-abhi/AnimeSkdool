export const RANKING_FILTER_CONFIG = {
  type: [
    { value: "", label: "All Types" },
    { value: "tv", label: "TV" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "special", label: "Special" },
    { value: "ona", label: "ONA" },
    { value: "music", label: "Music" },
  ],
  filter: [
    { value: "airing", label: "Airing" },
    { value: "upcoming", label: "Upcoming" },
    { value: "bypopularity", label: "By Popularity" },
    { value: "favorite", label: "Favorites" },
  ],
  rating: [
    { value: "", label: "All Ratings" },
    { value: "g", label: "G - All Ages" },
    { value: "pg", label: "PG - Children" },
    { value: "pg13", label: "PG-13" },
    { value: "r17", label: "R - 17+" },
    { value: "r", label: "R+ - Mild Nudity" },
    { value: "rx", label: "Rx - Hentai" },
  ],
};

export const ALL_GENRES = [
  { id: 1, name: "Action", icon: "⚔️" },
  { id: 2, name: "Adventure", icon: "🧭" },
  { id: 5, name: "Avant Garde", icon: "🎨" },
  { id: 46, name: "Award Winning", icon: "🏆" },
  { id: 4, name: "Comedy", icon: "😂" },
  { id: 8, name: "Drama", icon: "🎭" },
  { id: 10, name: "Fantasy", icon: "✨" },
  { id: 47, name: "Gourmet", icon: "🍳" },
  { id: 14, name: "Horror", icon: "👁️" },
  { id: 7, name: "Mystery", icon: "🕵️" },
  { id: 22, name: "Romance", icon: "💖" },
  { id: 24, name: "Sci-Fi", icon: "🚀" },
  { id: 36, name: "Slice of Life", icon: "🍵" },
  { id: 30, name: "Sports", icon: "⚽" },
  { id: 37, name: "Supernatural", icon: "🔮" },
  { id: 41, name: "Suspense", icon: "⚡" },
  { id: 28, name: "Boys Love", icon: "💙" },
  { id: 26, name: "Girls Love", icon: "🌸" },
  { id: 9, name: "Ecchi", icon: "🔥" },
];

export const ALL_THEMES = [
  { id: 62, name: "Isekai", icon: "🌀" },
  { id: 18, name: "Mecha", icon: "🤖" },
  { id: 40, name: "Psychological", icon: "🧠" },
  { id: 17, name: "Martial Arts", icon: "🥋" },
  { id: 13, name: "Historical", icon: "🏯" },
  { id: 23, name: "School", icon: "🏫" },
  { id: 19, name: "Music", icon: "🎵" },
  { id: 21, name: "Samurai", icon: "🗡️" },
  { id: 38, name: "Military", icon: "🪖" },
  { id: 78, name: "Time Travel", icon: "⏳" },
  { id: 32, name: "Vampire", icon: "🧛" },
  { id: 79, name: "Video Game", icon: "🎮" },
  { id: 76, name: "Survival", icon: "🏕️" },
  { id: 39, name: "Detective", icon: "🔍" },
  { id: 31, name: "Super Power", icon: "⚡" },
  { id: 6, name: "Mythology", icon: "⛩️" },
  { id: 58, name: "Gore", icon: "🩸" },
  { id: 50, name: "Adult Cast", icon: "💼" },
  { id: 63, name: "Iyashikei", icon: "🌿" },
  { id: 66, name: "Mahou Shoujo", icon: "🪄" },
  { id: 35, name: "Harem", icon: "👥" },
];

export const ALL_DEMOGRAPHICS = [
  { id: 27, name: "Shounen", icon: "🔥" },
  { id: 42, name: "Seinen", icon: "⚡" },
  { id: 25, name: "Shoujo", icon: "🌸" },
  { id: 43, name: "Josei", icon: "🍷" },
  { id: 15, name: "Kids", icon: "🎈" },
];

export const ALL_FORMATS = [
  { value: "", label: "All Formats" },
  { value: "tv", label: "TV Series" },
  { value: "movie", label: "Feature Film" },
  { value: "ova", label: "OVA (Original Video Anime)" },
  { value: "special", label: "Special" },
  { value: "ona", label: "ONA (Web Anime)" },
  { value: "music", label: "Music Video" },
];

export const ALL_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "airing", label: "Currently Airing" },
  { value: "upcoming", label: "Upcoming / Announced" },
  { value: "complete", label: "Finished Airing" },
];

export const ALL_SORT_OPTIONS = [
  { value: "popularity_desc", label: "Most Popular", order_by: "popularity", sort: "asc" },
  { value: "score_desc", label: "Highest Rated (10 → 1)", order_by: "score", sort: "desc" },
  { value: "score_asc", label: "Lowest Rated (1 → 10)", order_by: "score", sort: "asc" },
  { value: "favorites_desc", label: "Most Favorited", order_by: "favorites", sort: "desc" },
  { value: "title_asc", label: "Title (A → Z)", order_by: "title", sort: "asc" },
  { value: "title_desc", label: "Title (Z → A)", order_by: "title", sort: "desc" },
  { value: "date_desc", label: "Release Date (Newest)", order_by: "start_date", sort: "desc" },
  { value: "date_asc", label: "Release Date (Oldest)", order_by: "start_date", sort: "asc" },
  { value: "episodes_desc", label: "Episodes (Longest)", order_by: "episodes", sort: "desc" },
  { value: "episodes_asc", label: "Episodes (Shortest)", order_by: "episodes", sort: "asc" },
  { value: "members_desc", label: "Most Community Members", order_by: "members", sort: "desc" },
];

export const ALL_RATINGS = [
  { value: "", label: "All Age Ratings" },
  { value: "g", label: "G - All Ages" },
  { value: "pg", label: "PG - Children" },
  { value: "pg13", label: "PG-13 - Teens 13+" },
  { value: "r17", label: "R - 17+ (Violence & Profanity)" },
  { value: "r", label: "R+ - Mild Nudity" },
  { value: "rx", label: "Rx - Explicit (Hentai)" },
];

export const ALL_STUDIOS = [
  { id: "", name: "All Animation Studios" },
  { id: "569", name: "MAPPA (Jujutsu Kaisen, CSM)" },
  { id: "43", name: "ufotable (Demon Slayer, Fate)" },
  { id: "4", name: "Bones (My Hero Academia, Mob Psycho)" },
  { id: "858", name: "Wit Studio (Attack on Titan, Vinland)" },
  { id: "11", name: "Madhouse (Frieren, Death Note, HxH)" },
  { id: "2", name: "Kyoto Animation (Violet Evergarden)" },
  { id: "1835", name: "CloverWorks (Bocchi, Spy x Family)" },
  { id: "56", name: "A-1 Pictures (Solo Leveling, SAO)" },
  { id: "18", name: "Toei Animation (One Piece, Dragon Ball)" },
  { id: "1", name: "Pierrot (Naruto, Bleach)" },
  { id: "10", name: "Production I.G (Haikyuu!!, Psycho-Pass)" },
  { id: "44", name: "Shaft (Monogatari, Madoka)" },
  { id: "803", name: "Trigger (Cyberpunk Edgerunners, Kill la Kill)" },
  { id: "287", name: "David Production (JoJo, Fire Force)" },
  { id: "21", name: "Studio Ghibli (Spirited Away, Mononoke)" },
  { id: "95", name: "Doga Kobo (Oshi no Ko)" },
  { id: "132", name: "P.A. Works (Angel Beats!)" },
  { id: "7", name: "J.C.Staff (One Punch Man S2, Toradora)" },
];

export const ALL_YEARS = [
  { value: "", label: "All Release Years" },
  { value: "2026", label: "2026 (Upcoming)" },
  { value: "2025", label: "2025 (Current Year)" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2019", label: "2019" },
  { value: "2018", label: "2018" },
  { value: "2017", label: "2017" },
  { value: "2016", label: "2016" },
  { value: "2015", label: "2015" },
  { value: "2010", label: "2010s Era" },
  { value: "2000", label: "2000s Classic Era" },
  { value: "1990", label: "90s Golden Era" },
  { value: "1980", label: "80s Retro Era" },
];

export const COMMON_CLASS = {
  FILTERS: 'w-full rounded-xl px-3 py-2 border appearance-none bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none transition',
  DARK_BACKGROUNDS: 'text-[var(--primary-color)] bg-gray-900 sticky top-0 z-50 shadow-sm',
};