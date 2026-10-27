import React, { useEffect } from 'react';

const PhotoModal = ({ photo, onClose }) => {
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling ONLY when modal is active
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow || 'unset';
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {photo.author ? photo.author.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h4 className="font-semibold text-white leading-tight">{photo.author}</h4>
              <p className="text-xs text-slate-400">Photo ID: #{photo.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={photo.download_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Full Res
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Image Body */}
        <div className="relative flex-1 min-h-[300px] max-h-[65vh] bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={`https://picsum.photos/id/${photo.id}/1200/900`}
            alt={`Full photo by ${photo.author}`}
            className="w-full h-full object-contain max-h-[65vh]"
          />
        </div>

        {/* Modal Footer info */}
        <div className="px-6 py-3.5 bg-slate-900/95 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Dimensions: <strong className="text-slate-300 font-mono">{photo.width} × {photo.height}</strong></span>
            <span>Ratio: <strong className="text-slate-300 font-mono">{(photo.width / photo.height).toFixed(2)}:1</strong></span>
          </div>

          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            Original source on Unsplash
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
