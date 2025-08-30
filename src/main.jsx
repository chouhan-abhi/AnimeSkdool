import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      cacheTime: 1000 * 60 * 30, // 30 min
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Persist the React Query client
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

// --- Apply saved theme and font from localStorage ---
const SETTINGS_KEY = 'appSettings';

const applySavedSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    const root = document.documentElement;

    if (saved?.theme) {
      // Remove old theme classes
      root.classList.remove("theme-light", "theme-dark", "theme-saint");
      root.classList.add(saved.theme);
    }

    if (saved?.font) {
      // Remove old font classes
      root.classList.remove("font-basic", "font-funky", "font-techy", "font-cute", "font-retro");
      root.classList.add(saved.font);
    }
  } catch (err) {
    console.error('Failed to apply saved settings', err);
  }
};

// Apply settings immediately
applySavedSettings();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
