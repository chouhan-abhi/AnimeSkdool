export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const extractGenres = (list) => {
  const allGenres = new Set();
  list.forEach((anime) =>
    anime.genres?.forEach((g) => allGenres.add(g.name))
  );
  return ["All", ...Array.from(allGenres).sort()];
};
