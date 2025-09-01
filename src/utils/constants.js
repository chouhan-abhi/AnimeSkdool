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