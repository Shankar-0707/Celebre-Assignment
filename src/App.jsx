import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Gallery from './components/Gallery';

const FAVORITES_STORAGE_KEY = 'celebre_favorites';

/**
 * Initializer for useReducer: safely loads favourites from localStorage.
 */
const initFavorites = () => {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Failed to parse favourites from localStorage:', err);
    return [];
  }
};

/**
 * Favourites Reducer managing the list of favourite photo IDs.
 * Actions:
 * - TOGGLE_FAVORITE: Toggles photoId in or out of the favourites array.
 * - CLEAR_FAVORITES: Clears all favourites.
 */
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const photoId = action.payload;
      return state.includes(photoId)
        ? state.filter((id) => id !== photoId)
        : [...state, photoId];
    }
    case 'CLEAR_FAVORITES':
      return [];
    default:
      return state;
  }
};

function App() {
  const [photoCount, setPhotoCount] = useState(0);
  const refreshRef = useRef(null);

  // Manage favourites list using useReducer (strictly not useState)
  const [favorites, dispatchFavorites] = useReducer(favoritesReducer, [], initFavorites);

  // Synchronize favourites to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to persist favourites to localStorage:', err);
    }
  }, [favorites]);

  // Toggle favorite action dispatcher
  const toggleFavorite = useCallback((photoId) => {
    dispatchFavorites({ type: 'TOGGLE_FAVORITE', payload: photoId });
  }, []);

  const handleRefresh = useCallback(() => {
    if (refreshRef.current) {
      refreshRef.current(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        photoCount={photoCount}
        favoritesCount={favorites.length}
        onRefresh={handleRefresh}
        loading={false}
      />

      {/* Main Gallery Component (uses useFetchPhotos hook) */}
      <Gallery
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onPhotosLoaded={setPhotoCount}
        onRefreshRef={refreshRef}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>Celebre Assignment • Picsum Photos API Integration</p>
      </footer>
    </div>
  );
}

export default App;