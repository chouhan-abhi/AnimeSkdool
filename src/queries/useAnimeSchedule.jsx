// hooks/useAnimeSchedule.js
import { useQuery } from '@tanstack/react-query';

const fetchSchedule = async (query) => {
  const response = await fetch(`https://api.jikan.moe/v4/schedules${query || ''}`, {
    method: "GET",
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.data; // Assuming you want the array from the `data` field
};

export const useAnimeSchedule = (query) =>
  useQuery({
    queryKey: ['anime-schedule', query],
    queryFn: () => fetchSchedule(query),
  });
