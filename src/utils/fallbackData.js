/**
 * High-fidelity fallback catalog for AnimeSkdool
 * Ensures the app works 100% of the time, even during Jikan API 504 outages.
 */

export const FALLBACK_TOP_AIRING = [
  {
    mal_id: 52991,
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey's End",
    title_japanese: "葬送のフリーレン",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.webp",
        small_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006t.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006t.jpg",
      },
    },
    trailer: {
      youtube_id: "qgQunxD0qMo",
      url: "https://www.youtube.com/watch?v=qgQunxD0qMo",
      embed_url: "https://www.youtube.com/embed/qgQunxD0qMo?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "During their decade-long quest to defeat the Demon King, the members of the hero's party—Himmel, Heiter, Eisen, and the elven mage Frieren—forge deep bonds. With the world saved, Frieren takes her leave. Decades pass before she returns to find her mortal companions aged. Himmel's death prompts Frieren to embark on a new journey to understand humanity.",
    type: "TV",
    episodes: 28,
    status: "Finished Airing",
    score: 9.34,
    scored_by: 450000,
    rank: 1,
    popularity: 45,
    rating: "PG-13 - Teens 13 or older",
    genres: [{ mal_id: 2, name: "Adventure" }, { mal_id: 10, name: "Fantasy" }, { mal_id: 8, name: "Drama" }],
    studios: [{ mal_id: 11, name: "Madhouse" }],
    broadcast: { day: "Fridays", time: "23:00", timezone: "Asia/Tokyo", string: "Fridays at 23:00 (JST)" },
    year: 2023,
    season: "fall",
  },
  {
    mal_id: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    title_japanese: "鋼の錬金術師 FULLMETAL ALCHEMIST",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
      },
    },
    trailer: {
      youtube_id: "--IcmZkvL0Q",
      embed_url: "https://www.youtube.com/embed/--IcmZkvL0Q?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. Ignoring the alchemy restriction against human transmutation, the boys attempted to bring their recently deceased mother back to life.",
    type: "TV",
    episodes: 64,
    status: "Finished Airing",
    score: 9.10,
    rank: 2,
    popularity: 3,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 2, name: "Adventure" }, { mal_id: 8, name: "Drama" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 4, name: "Bones" }],
    broadcast: { day: "Sundays", time: "17:00", timezone: "Asia/Tokyo", string: "Sundays at 17:00 (JST)" },
    year: 2009,
    season: "spring",
  },
  {
    mal_id: 52034,
    title: "Solo Leveling",
    title_english: "Solo Leveling",
    title_japanese: "俺だけレベルアップな件",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1769/140650.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1769/140650l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1769/140650.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1769/140650l.jpg",
      },
    },
    trailer: {
      youtube_id: "9n_qO_i_cMo",
      embed_url: "https://www.youtube.com/embed/9n_qO_i_cMo?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "A decade ago, the 'Gate' appeared and connected the real world with the realm of magic and monsters. To combat these vile beasts, ordinary people were bestowed with superhuman powers and became known as 'Hunters'. Sung Jin-Woo is an E-rank hunter known as the 'Weakest'.",
    type: "TV",
    episodes: 12,
    status: "Finished Airing",
    score: 8.35,
    rank: 180,
    popularity: 75,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 56, name: "A-1 Pictures" }],
    broadcast: { day: "Sundays", time: "00:00", timezone: "Asia/Tokyo", string: "Sundays at 00:00 (JST)" },
    year: 2024,
    season: "winter",
  },
  {
    mal_id: 51009,
    title: "Jujutsu Kaisen 2nd Season",
    title_english: "Jujutsu Kaisen Season 2",
    title_japanese: "呪術廻戦 懐玉・玉折／渋谷事変",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1792/138042.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138042l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1792/138042.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138042l.jpg",
      },
    },
    trailer: {
      youtube_id: "O6qVieflwQs",
      embed_url: "https://www.youtube.com/embed/O6qVieflwQs?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "The year is 2006, and the halls of Jujutsu High echo with the banter and rivalry of two close friends: Satoru Gojou and Suguru Getou. Unmatched in skill, they are assigned a top-secret mission to escort Riko Amanai, the Star Plasma Vessel.",
    type: "TV",
    episodes: 23,
    status: "Finished Airing",
    score: 8.79,
    rank: 35,
    popularity: 58,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 569, name: "MAPPA" }],
    broadcast: { day: "Thursdays", time: "23:56", timezone: "Asia/Tokyo", string: "Thursdays at 23:56 (JST)" },
    year: 2023,
    season: "summer",
  },
  {
    mal_id: 38000,
    title: "Kimetsu no Yaiba",
    title_english: "Demon Slayer: Kimetsu no Yaiba",
    title_japanese: "鬼滅の刃",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
      },
    },
    trailer: {
      youtube_id: "6vMuWuWlW4I",
      embed_url: "https://www.youtube.com/embed/6vMuWuWlW4I?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. Although living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful life.",
    type: "TV",
    episodes: 26,
    status: "Finished Airing",
    score: 8.48,
    rank: 120,
    popularity: 6,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 43, name: "ufotable" }],
    broadcast: { day: "Saturdays", time: "23:30", timezone: "Asia/Tokyo", string: "Saturdays at 23:30 (JST)" },
    year: 2019,
    season: "spring",
  },
  {
    mal_id: 41467,
    title: "Bleach: Sennen Kessen-hen",
    title_english: "Bleach: Thousand-Year Blood War",
    title_japanese: "BLEACH 千年血戦篇",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1764/126627.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1764/126627l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1764/126627.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1764/126627l.jpg",
      },
    },
    trailer: {
      youtube_id: "e8YBesRKq_o",
      embed_url: "https://www.youtube.com/embed/e8YBesRKq_o?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "Substitute Soul Reaper Ichigo Kurosaki spends his days fighting against Hollows, dangerous evil spirits that threaten Karakura Town. Ichigo carries out his quest with his closest allies: Orihime Inoue, Yasutora Sado, and Uryuu Ishida.",
    type: "TV",
    episodes: 13,
    status: "Finished Airing",
    score: 9.02,
    rank: 6,
    popularity: 280,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 2, name: "Adventure" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 1, name: "Pierrot" }],
    broadcast: { day: "Mondays", time: "00:00", timezone: "Asia/Tokyo", string: "Mondays at 00:00 (JST)" },
    year: 2022,
    season: "fall",
  },
  {
    mal_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    title_japanese: "ONE PIECE",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/1244/138851.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1244/138851l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/1244/138851l.jpg",
      },
    },
    trailer: {
      youtube_id: "MCb13lbK-nQ",
      embed_url: "https://www.youtube.com/embed/MCb13lbK-nQ?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "Gol D. Roger was known as the 'Pirate King', the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought about a change throughout the world.",
    type: "TV",
    episodes: null,
    status: "Currently Airing",
    score: 8.73,
    rank: 48,
    popularity: 18,
    rating: "PG-13 - Teens 13 or older",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 2, name: "Adventure" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 18, name: "Toei Animation" }],
    broadcast: { day: "Sundays", time: "09:30", timezone: "Asia/Tokyo", string: "Sundays at 09:30 (JST)" },
    year: 1999,
    season: "fall",
  },
  {
    mal_id: 16498,
    title: "Shingeki no Kyojin",
    title_english: "Attack on Titan",
    title_japanese: "進撃の巨人",
    images: {
      webp: {
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.webp",
        large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.webp",
      },
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
      },
    },
    trailer: {
      youtube_id: "LHtdKWJjeg4",
      embed_url: "https://www.youtube.com/embed/LHtdKWJjeg4?enablejsapi=1&wmode=opaque&autoplay=1",
    },
    synopsis: "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls.",
    type: "TV",
    episodes: 25,
    status: "Finished Airing",
    score: 8.55,
    rank: 105,
    popularity: 1,
    rating: "R - 17+ (violence & profanity)",
    genres: [{ mal_id: 1, name: "Action" }, { mal_id: 8, name: "Drama" }, { mal_id: 10, name: "Fantasy" }],
    studios: [{ mal_id: 858, name: "Wit Studio" }],
    broadcast: { day: "Sundays", time: "01:58", timezone: "Asia/Tokyo", string: "Sundays at 01:58 (JST)" },
    year: 2013,
    season: "spring",
  }
];

export const FALLBACK_REVIEWS = [
  {
    mal_id: 1001,
    score: 10,
    review: "An absolute masterpiece that redefines modern fantasy anime. The pacing, emotional weight, and musical score by Evan Call create an unforgettable experience.",
    date: "2025-01-15T10:00:00Z",
    user: {
      username: "AnimeCritic",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[0]
  },
  {
    mal_id: 1002,
    score: 9,
    review: "Superb animation quality and stellar fight choreography. MAPPA delivered some of the greatest combat episodes in shonen history.",
    date: "2025-02-01T14:30:00Z",
    user: {
      username: "SakugaFan",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[3]
  },
  {
    mal_id: 1003,
    score: 10,
    review: "The character progression of Sung Jin-woo is exhilarating. A-1 Pictures elevated the manhwa source material with incredible sound design and visceral battle animation.",
    date: "2025-02-10T18:45:00Z",
    user: {
      username: "ShadowMonarch",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[1]
  },
  {
    mal_id: 1004,
    score: 9,
    review: "Ufotable continues to set the gold standard for visual effects, sound mixing, and emotional climaxes. Every season feels like a big-budget theatrical movie.",
    date: "2025-02-14T09:20:00Z",
    user: {
      username: "HashiraWatcher",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[4]
  },
  {
    mal_id: 1005,
    score: 10,
    review: "The narrative depth, political tension, and high-stakes philosophical clashes make Attack on Titan a monumental triumph in storytelling.",
    date: "2025-02-16T12:00:00Z",
    user: {
      username: "EldianHistorian",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[7]
  },
  {
    mal_id: 1006,
    score: 9,
    review: "Bleach's Thousand-Year Blood War arc brought modern cinematic fidelity and breathtaking direction back to the classic Big 3 franchise.",
    date: "2025-02-18T16:10:00Z",
    user: {
      username: "BankaiMaster",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[5]
  },
  {
    mal_id: 1007,
    score: 8,
    review: "The worldbuilding in One Piece is unmatched. The Egghead arc brings unbelievable lore revelations and breathtaking new animation styles.",
    date: "2025-02-19T20:00:00Z",
    user: {
      username: "StrawHatVoyager",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[6]
  },
  {
    mal_id: 1008,
    score: 9,
    review: "A refreshing fantasy with deep character interactions, mature themes of grief, and gentle humor. One of the best anime of the decade.",
    date: "2025-02-20T11:15:00Z",
    user: {
      username: "MageJourney",
      images: {
        jpg: {
          image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80"
        }
      }
    },
    entry: FALLBACK_TOP_AIRING[0]
  }
];
