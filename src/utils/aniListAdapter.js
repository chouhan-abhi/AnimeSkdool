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
    rating: media.isAdult ? "Rx - Hentai" : "PG-13 - Teens 13 or older",
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

export async function fetchAniListCatalog({ filter = "airing", limit = 20, page = 1, search = "", signal } = {}) {
  let query = "";
  const variables = { page, perPage: limit };

  if (search) {
    query = `
      query ($page: Int, $perPage: Int, $search: String) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;
    variables.search = search;
  } else if (filter === "airing") {
    query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(status: RELEASING, type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;
  } else if (filter === "upcoming") {
    query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(status: NOT_YET_RELEASED, type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;
  } else {
    query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, isAdult: false, sort: [SCORE_DESC, POPULARITY_DESC]) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;
  }

  const data = await queryAniList(query, variables, signal);
  const mediaList = data?.Page?.media || [];
  return mediaList.map(mapAniListToJikan);
}

export async function fetchAniListSingle(idMal, signal) {
  const query = `
    query ($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  const data = await queryAniList(query, { idMal }, signal);
  return data?.Media ? mapAniListToJikan(data.Media) : null;
}
