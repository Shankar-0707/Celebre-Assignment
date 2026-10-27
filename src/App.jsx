import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PhotoCard from './components/PhotoCard';
import PhotoModal from './components/PhotoModal';

const PICSUM_API_URL =
  import.meta.env.VITE_PICSUM_API_URL || 'https://picsum.photos/v2/list?limit=30';

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

  // Favorites state with localStorage persistence
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('celebre_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle favorite status for a photo
  const toggleFavorite = useCallback((photoId) => {
    setFavorites((prev) => {
      const next = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];
      try {
        localStorage.setItem('celebre_favorites', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
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

  // Filter photos by author name and optional favorites toggle
  const filteredPhotos = photos.filter((photo) => {
    const matchesAuthor = photo.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = showFavoritesOnly ? favorites.includes(photo.id) : true;
    return matchesAuthor && matchesFavorite;
  });

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
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
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

          {/* Search & Actions Bar (shown when photos are loaded) */}
          {!loading && !error && photos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Scroll Container Toggle */}
              <button
                id="toggle-scroll-view"
                onClick={() => setIsScrollContainer((prev) => !prev)}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isScrollContainer
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Toggle between scrollable viewport and full-page layout"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {isScrollContainer ? 'Scroll Bar View: ON' : 'Scroll Bar View: OFF'}
              </button>

              {/* Favorites Filter Toggle */}
              <button
                id="toggle-favorites-filter"
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Filter to show liked photos only"
              >
                <svg
                  className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : 'fill-none'}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Favorites {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
              </button>

              {/* Author Search Filter */}
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  placeholder="Filter by author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 pl-9 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    title="Clear filter"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Test Error Button */}
              <button
                onClick={() => fetchPhotos(true)}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                title="Simulate API failure to test error state and retry"
              >
                Simulate Error
              </button>
            </div>
          )}
        </div>

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
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">
                  {showFavoritesOnly
                    ? 'No favorite photos yet. Click the heart icon on any photo to like it!'
                    : `No photos found matching "${searchQuery}"`}
                </p>
                {(searchQuery || showFavoritesOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowFavoritesOnly(false);
                    }}
                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    Reset all filters
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