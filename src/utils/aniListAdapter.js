/**
 * AniList GraphQL Fallback Adapter
 * Converts AniList GraphQL responses to MyAnimeList / Jikan format seamlessly.
 */

const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";

export const mapAniListToJikan = (media) => {
  if (!media) return null;
  const scoreNum = media.averageScore
    ? (media.averageScore / 10).toFixed(1)
    : media.meanScore
    ? (media.meanScore / 10).toFixed(1)
    : null;

  const airingTime = media.nextAiringEpisode
    ? new Date(media.nextAiringEpisode.airingAt * 1000)
    : null;

  // Compute realistic rating label based on adult status and genre tags
  let derivedRating = "PG-13 - Teens 13 or older";
  if (media.isAdult) {
    derivedRating = "Rx - Hentai";
  } else if (media.genres?.includes("Ecchi")) {
    derivedRating = "R+ - Mild Nudity";
  } else if (media.genres?.includes("Horror") || media.genres?.includes("Gore") || media.genres?.includes("Psychological")) {
    derivedRating = "R - 17+ (violence & profanity)";
  } else if (media.genres?.includes("Kids")) {
    derivedRating = "PG - Children";
  }

  return {
    mal_id: media.idMal || media.id,
    id: media.id,
    title: media.title?.userPreferred || media.title?.english || media.title?.romaji || "Anime",
    title_english: media.title?.english || media.title?.romaji,
    title_japanese: media.title?.native,
    images: {
      webp: {
        image_url: media.coverImage?.large || media.coverImage?.medium || "",
        large_image_url: media.coverImage?.extraLarge || media.coverImage?.large || "",
        small_image_url: media.coverImage?.medium || "",
      },
      jpg: {
        image_url: media.coverImage?.large || media.coverImage?.medium || "",
        large_image_url: media.coverImage?.extraLarge || media.coverImage?.large || "",
        small_image_url: media.coverImage?.medium || "",
      },
    },
    banner_image: media.bannerImage || null,
    trailer: media.trailer?.id
      ? {
          youtube_id: media.trailer.id,
          url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
          embed_url: `https://www.youtube.com/embed/${media.trailer.id}?autoplay=1`,
        }
      : null,
    synopsis: media.description
      ? media.description.replace(/<[^>]*>?/gm, "").trim()
      : "No synopsis available.",
    type: media.format || "TV",
    episodes: media.episodes || null,
    status:
      media.status === "RELEASING"
        ? "Currently Airing"
        : media.status === "FINISHED"
        ? "Finished Airing"
        : media.status === "NOT_YET_RELEASED"
        ? "Not yet aired"
        : media.status,
    score: scoreNum ? Number(scoreNum) : 8.2,
    scored_by: media.popularity || 10000,
    rank: media.rank || null,
    popularity: media.popularity || null,
    rating: derivedRating,
    genres: (media.genres || []).map((g, idx) => ({ mal_id: idx + 1, name: g })),
    studios: (media.studios?.nodes || []).map((s) => ({ mal_id: s.id, name: s.name })),
    broadcast: airingTime
      ? {
          day: airingTime.toLocaleDateString("en-US", { weekday: "long" }) + "s",
          time: airingTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          timezone: "Asia/Tokyo",
          string: `${airingTime.toLocaleDateString("en-US", { weekday: "long" })}s at ${airingTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
        }
      : { day: "Fridays", time: "23:00", timezone: "Asia/Tokyo", string: "Weekly Broadcast" },
    year: media.seasonYear || media.startDate?.year || new Date().getFullYear(),
    season: media.season ? media.season.toLowerCase() : "fall",
  };
};

const MEDIA_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
    userPreferred
  }
  coverImage {
    extraLarge
    large
    medium
  }
  bannerImage
  description(asHtml: false)
  format
  status
  episodes
  duration
  averageScore
  meanScore
  popularity
  genres
  isAdult
  season
  seasonYear
  startDate {
    year
    month
    day
  }
  studios(isMain: true) {
    nodes {
      id
      name
    }
  }
  trailer {
    id
    site
  }
  nextAiringEpisode {
    airingAt
    episode
  }
`;

export async function queryAniList(query, variables = {}, signal) {
  const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`AniList GraphQL Error: ${res.status}`);
  }

  const json = await res.json();
  return json?.data;
}

export async function fetchAniListCatalog({
  filter = "airing",
  limit = 24,
  page = 1,
  search = "",
  genre = "",
  genres = [],
  format = "",
  status = "",
  rating = "",
  sfw = "true",
  season = "",
  seasonYear = null,
  sort = null,
  signal,
} = {}) {
  const variables = {
    page: Number(page) || 1,
    perPage: Number(limit) || 24,
  };

  const isAdultQuery = rating === "rx" || (sfw === "false" && rating === "rx");
  const conditions = ["type: ANIME"];
  if (!isAdultQuery && sfw === "true") {
    conditions.push("isAdult: false");
  } else if (isAdultQuery) {
    conditions.push("isAdult: true");
  }

  if (search) {
    variables.search = search;
    conditions.push("search: $search");
  }

  if (genre) {
    variables.genre = genre;
    conditions.push("genre: $genre");
  } else if (Array.isArray(genres) && genres.length > 0) {
    variables.genre_in = genres;
    conditions.push("genre_in: $genre_in");
  }

  if (format) {
    const formatUpper = format.toUpperCase();
    if (["TV", "MOVIE", "OVA", "SPECIAL", "ONA", "MUSIC"].includes(formatUpper)) {
      variables.format = formatUpper;
      conditions.push("format: $format");
    }
  }

  if (status) {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "AIRING" || statusUpper === "RELEASING") {
      conditions.push("status: RELEASING");
    } else if (statusUpper === "UPCOMING" || statusUpper === "NOT_YET_RELEASED") {
      conditions.push("status: NOT_YET_RELEASED");
    } else if (statusUpper === "FINISHED" || statusUpper === "COMPLETE") {
      conditions.push("status: FINISHED");
    }
  } else if (!search && filter === "airing") {
    conditions.push("status: RELEASING");
  } else if (!search && filter === "upcoming") {
    conditions.push("status: NOT_YET_RELEASED");
  }

  if (season) {
    variables.season = season.toUpperCase();
    conditions.push("season: $season");
  }

  if (seasonYear) {
    variables.seasonYear = Number(seasonYear);
    conditions.push("seasonYear: $seasonYear");
  }

  // Sorting
  let sortField = "[POPULARITY_DESC]";
  if (sort) {
    sortField = Array.isArray(sort) ? JSON.stringify(sort).replace(/"/g, "") : `[${sort}]`;
  } else if (filter === "top" || filter === "favorite") {
    sortField = "[SCORE_DESC, POPULARITY_DESC]";
  } else if (filter === "upcoming") {
    sortField = "[POPULARITY_DESC]";
  }

  const varDefs = [
    "$page: Int",
    "$perPage: Int",
    search ? "$search: String" : null,
    genre ? "$genre: String" : null,
    Array.isArray(genres) && genres.length > 0 ? "$genre_in: [String]" : null,
    format ? "$format: MediaFormat" : null,
    season ? "$season: MediaSeason" : null,
    seasonYear ? "$seasonYear: Int" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const query = `
    query (${varDefs}) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(${conditions.join(", ")}, sort: ${sortField}) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  try {
    const data = await queryAniList(query, variables, signal);
    const mediaList = data?.Page?.media || [];
    const pageInfo = data?.Page?.pageInfo || {};
    return {
      data: mediaList.map(mapAniListToJikan),
      pagination: {
        has_next_page: Boolean(pageInfo.hasNextPage),
        current_page: pageInfo.currentPage || page,
        last_visible_page: pageInfo.lastPage || 1,
        items: {
          total: pageInfo.total || mediaList.length,
          count: mediaList.length,
          per_page: limit,
        },
      },
    };
  } catch (err) {
    console.warn("[AniList Adapter] GraphQL query failed:", err);
    throw err;
  }
}

export async function fetchAniListSingle(idMal, signal) {
  const query = `
    query ($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  try {
    const data = await queryAniList(query, { idMal }, signal);
    return data?.Media ? mapAniListToJikan(data.Media) : null;
  } catch {
    return null;
  }
}
