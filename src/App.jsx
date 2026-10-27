import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PhotoCard from './components/PhotoCard';
import PhotoModal from './components/PhotoModal';

const PICSUM_API_URL =
  import.meta.env.VITE_PICSUM_API_URL || 'https://picsum.photos/v2/list?limit=30';

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
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrollContainer, setIsScrollContainer] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const scrollContainerRef = useRef(null);

  // Manage favourites list using useReducer (not useState)
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

  // Fetch photos from Picsum API
  const fetchPhotos = useCallback(async (isSimulatedError = false) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      if (isSimulatedError) {
        throw new Error('Simulated network error: Failed to fetch photos from Picsum API.');
      }

      const response = await fetch(PICSUM_API_URL, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Received invalid data format from Picsum API');
      }

      setPhotos(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The server took too long to respond.');
      } else {
        setError(err.message || 'An unexpected error occurred while fetching photos.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  // Fetch on initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPhotos();
  }, [fetchPhotos]);

  // Window scroll listener for Back-to-Top button
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // Handle scroll in dedicated container
  const handleContainerScroll = (e) => {
    if (e.target.scrollTop > 200) {
      setShowScrollTop(true);
    } else if (window.scrollY <= 300) {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (isScrollContainer && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real-time client-side filter by author name (strictly no API call, no page reload)
  const filteredPhotos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return photos.filter((photo) => {
      const matchesAuthor = !query || photo.author.toLowerCase().includes(query);
      const matchesFavorite = showFavoritesOnly ? favorites.includes(photo.id) : true;
      return matchesAuthor && matchesFavorite;
    });
  }, [photos, searchQuery, showFavoritesOnly, favorites]);

  // Extract unique author names from pre-fetched photos for real-time quick filter chips
  const authorSuggestions = useMemo(() => {
    const unique = [];
    for (const p of photos) {
      if (p.author && !unique.includes(p.author)) {
        unique.push(p.author);
        if (unique.length >= 6) break;
      }
    }
    return unique;
  }, [photos]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        photoCount={photos.length}
        favoritesCount={favorites.length}
        onRefresh={() => fetchPhotos(false)}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero Section */}
        <div className="mb-6 pb-6 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Picsum Photos API Integration
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated Photo Stream
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Fetching 30 high-resolution photos on load from{' '}
            <a
              href={PICSUM_API_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              {PICSUM_API_URL.replace(/^https?:\/\//, '')}
            </a>
            .
          </p>
        </div>

        {/* Dedicated Search Filter Bar at Top (Real-time client-side filter, strictly no page reload or API calls) */}
        {!loading && !error && photos.length > 0 && (
          <div className="mb-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Real-time Search Input Form (Zero API calls, strictly no page reload) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="relative flex-1"
                role="search"
              >
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    id="author-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchQuery('');
                    }}
                    placeholder="Search photos by author name in real-time (e.g. Alejandro, Paul, Jerry)..."
                    aria-label="Filter photos by author name in real-time"
                    autoComplete="off"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-32 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                  />

                  {/* Input Actions: Real-time matches count & Clear button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Clear search (Esc)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 hidden sm:inline-block">
                      {filteredPhotos.length} / {photos.length}
                    </span>
                  </div>
                </div>
              </form>

              {/* Action Controls: Favorites toggle, Scroll View toggle, Simulate Error */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Favorites Filter Toggle */}
                <button
                  id="toggle-favorites-filter"
                  onClick={() => setShowFavoritesOnly((prev) => !prev)}
                  className={`px-3.5 py-2.5 text-xs font-medium rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    showFavoritesOnly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Filter to show liked photos only"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : 'fill-none'}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Favorites {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
                </button>

                {/* Scroll Container Toggle */}
                <button
                  id="toggle-scroll-view"
                  onClick={() => setIsScrollContainer((prev) => !prev)}
                  className={`px-3.5 py-2.5 text-xs font-medium rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isScrollContainer
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Toggle between scrollable viewport and full-page layout"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {isScrollContainer ? 'Scroll Bar View' : 'Full Page View'}
                </button>

                {/* Test Error Button */}
                <button
                  onClick={() => fetchPhotos(true)}
                  className="px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  title="Simulate API failure to test error state and retry"
                >
                  Simulate Error
                </button>
              </div>
            </div>

            {/* Quick Author Filter Chips & Live Search Status */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium">Quick author filter:</span>
                {authorSuggestions.map((author) => (
                  <button
                    key={author}
                    type="button"
                    onClick={() => setSearchQuery(author)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      searchQuery.toLowerCase() === author.toLowerCase()
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {author}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    Showing <strong className="text-indigo-400 font-mono">{filteredPhotos.length}</strong> {filteredPhotos.length === 1 ? 'photo' : 'photos'} matching <span className="text-slate-200 font-medium">"{searchQuery}"</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 cursor-pointer font-medium ml-1"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* State 1: Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* State 2: Error Message */}
        {!loading && error && (
          <ErrorMessage
            error={error}
            onRetry={() => fetchPhotos(false)}
          />
        )}

        {/* State 3: Photos Grid Display */}
        {!loading && !error && (
          <>
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-200">No photos found</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md">
                  {searchQuery
                    ? `No photos found matching author "${searchQuery}". Check the spelling or try another author.`
                    : showFavoritesOnly
                    ? 'No favorite photos yet. Click the heart icon on any photo to like it!'
                    : 'No photos available.'}
                </p>
                {(searchQuery || showFavoritesOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowFavoritesOnly(false);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    Reset Search & Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Scroll Indicator Info Banner */}
                {isScrollContainer && (
                  <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                      Use the scroll bar on the right to view all {filteredPhotos.length} photos
                    </span>
                    <span className="font-mono text-indigo-400">Scrollable Gallery View</span>
                  </div>
                )}

                {/* Grid Container (Scrollable or Full) */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleContainerScroll}
                  className={
                    isScrollContainer
                      ? 'gallery-scroll-container max-h-[72vh] overflow-y-auto pr-3 p-1 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm'
                      : ''
                  }
                >
                  {/* Responsive Grid: Desktop: 4 columns | Tablet: 2 columns | Mobile: 1 column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                    {filteredPhotos.map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        isFavorite={favorites.includes(photo.id)}
                        onToggleFavorite={toggleFavorite}
                        onSelect={(p) => setSelectedPhoto(p)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          id="scroll-to-top-btn"
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          title="Scroll back to top"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Lightbox Modal (rendered only when photo is selected) */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isFavorite={favorites.includes(selectedPhoto.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>Celebre Assignment • Picsum Photos API Integration</p>
      </footer>
    </div>
  );
}

export default App;