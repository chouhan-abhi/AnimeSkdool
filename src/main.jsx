import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import storageManager from './utils/storageManager';
import { ToastProvider } from './utils/toast';

// Detect if we're on a low-memory device (mobile)
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: isMobile ? 1000 * 60 * 5 : 1000 * 60 * 30, // 5 min on mobile, 30 min on desktop
      retry: isMobile ? 1 : 3, // Fewer retries on mobile
      refetchOnWindowFocus: false, // Don't refetch when tab becomes active
    },
  },
});

// REMOVED: React Query persistence to localStorage
// This was causing crashes on mobile due to:
// 1. Synchronous localStorage writes blocking the main thread
// 2. Infinite query data growing unbounded
// 3. JSON parsing large data on app startup

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

// Service Worker Registration - DISABLED on mobile to prevent crashes
// Enable by setting localStorage.setItem('enableSW', 'true')
const enableSW = !isMobile || localStorage.getItem('enableSW') === 'true';

if ("serviceWorker" in navigator && enableSW) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("✅ Service Worker registered:", reg.scope);
        
        // Check for updates periodically (every 5 minutes)
        setInterval(() => {
          reg.update().catch(() => {});
        }, 5 * 60 * 1000);
      })
      .catch((err) => {
        console.error("❌ Service Worker failed:", err);
        // Don't block app if SW fails
      });
  });
} else if ("serviceWorker" in navigator && isMobile) {
  // Unregister existing service worker on mobile
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log("🔄 Service Worker unregistered for mobile");
    }
  });
}

// Utility to clear all caches (can be called from console for debugging)
window.clearAppCaches = async () => {
  try {
    // Clear service worker caches
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      console.log("✅ All caches cleared");
    }
    
    // Clear React Query cache
    queryClient.clear();
    console.log("✅ React Query cache cleared");
    
    // Reload to get fresh data
    window.location.reload();
  } catch (err) {
    console.error("Error clearing caches:", err);
  }
};


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
