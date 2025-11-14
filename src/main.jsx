import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import storageManager from './utils/storageManager';
import { ToastProvider } from './utils/toast';

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

// --- Apply saved theme and font from storageManager ---
const applySavedSettings = () => {
  try {
    const saved = storageManager.getSettings();
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
    if (saved?.primaryColor) {
      // Remove old primaryColor classes
      root.classList.remove(
        "primary-red", "primary-blue", "primary-green", "primary-purple",
        "primary-orange", "primary-pink", "primary-cyan", "primary-yellow"
      );
      root.classList.add(saved.primaryColor);
    }
  } catch (err) {
    console.error('Failed to apply saved settings', err);
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registered:", reg.scope))
      .catch((err) => console.error("❌ Service Worker failed:", err));
  });
}


// Apply settings immediately
applySavedSettings();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
