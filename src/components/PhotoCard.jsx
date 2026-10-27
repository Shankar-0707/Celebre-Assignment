import { useState } from 'react';

const PhotoCard = ({
  photo,
  onSelect,
  isFavorite: controlledIsFavorite,
  onToggleFavorite,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [internalLiked, setInternalLiked] = useState(false);

  // Support both controlled (from App state with localStorage) and uncontrolled usage
  const isFavorite =
    controlledIsFavorite !== undefined ? controlledIsFavorite : internalLiked;

  const handleHeartClick = (e) => {
    e.stopPropagation(); // Prevent opening modal when clicking heart
    if (onToggleFavorite) {
      onToggleFavorite(photo.id);
    } else {
      setInternalLiked((prev) => !prev);
    }
  };

  // Use Picsum's resized URL format for crisp, ultra-fast thumbnail loading
  const previewUrl = `https://picsum.photos/id/${photo.id}/700/500`;

  return (
    <div
      onClick={() => onSelect(photo)}
      className="group relative bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
    >
      {/* 1. Photo Container with 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        {/* Placeholder skeleton while loading image */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-700 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs">Failed to load preview</span>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={`Photo by ${photo.author}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Floating Heart Icon Button on Image (quick access) */}
        <button
          type="button"
          id={`favorite-btn-overlay-${photo.id}`}
          onClick={handleHeartClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Unlike photo' : 'Like photo'}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-lg active:scale-90 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105 opacity-100'
              : 'bg-slate-900/75 text-slate-300 hover:text-rose-400 hover:bg-slate-900 border border-slate-700/60 opacity-90 group-hover:opacity-100'
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isFavorite ? 'fill-current scale-110' : 'fill-none'
            }`}
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
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/50">
              #{photo.id}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white shadow-sm mr-9">
              Quick View
            </span>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Click to expand image
          </div>
        </div>
      </div>

      {/* 2. Card Info: Author Name and Heart Icon Button */}
      <div className="p-4 flex items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-sm border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar initial */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-indigo-500/20">
            {photo.author ? photo.author.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="min-w-0">
            {/* Author Name */}
            <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors" title={photo.author}>
              {photo.author}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {photo.width} × {photo.height} px
            </p>
          </div>
        </div>

        {/* Action Buttons: Heart Icon Button & External Link */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 3. Heart Icon Button */}
          <button
            type="button"
            id={`favorite-btn-${photo.id}`}
            onClick={handleHeartClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Unlike photo' : 'Like photo'}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border active:scale-90 ${
              isFavorite
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 hover:bg-rose-500/25 scale-105'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-rose-400 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isFavorite ? 'fill-rose-500 scale-110' : 'fill-none'
              }`}
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
          </button>

          {/* External Link button */}
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="View on Unsplash"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
