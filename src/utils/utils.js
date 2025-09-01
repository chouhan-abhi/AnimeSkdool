export const contentProvider = [
    {
        url: "https://anikoto.tv/filter?keyword=",
        name: "Anikoto",
    },
    {
        url: "https://9anime.org.lv/?s=",
        name: "9Anime",
    },
];

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "b";
  if (absNum >= 1_000_000) return (num / 1_000_000).toFixed(1) + "m";
  if (absNum >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
};