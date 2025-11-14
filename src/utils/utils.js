import { useState, useEffect } from "react";

export const contentProvider = [
    {
        url: "https://anikoto.tv/filter?keyword=",
        name: "Anikoto",
    },
    {
        url: "https://9anime.org.lv/?s=",
        name: "9Anime",
    },
    {
        url: "https://www.crunchyroll.com/search?q=",
        name: "Crunchyroll",
    }
];

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "b";
  if (absNum >= 1_000_000) return (num / 1_000_000).toFixed(1) + "m";
  if (absNum >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
};

// ✅ Reusable debounce hook
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};