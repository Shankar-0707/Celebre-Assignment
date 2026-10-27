import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4 min-h-[50vh]">
      {/* Animated Glowing Spinner */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Ambient Glow */}
        <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>

        {/* Outer Rotating Ring */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 border-r-indigo-400 animate-spin"></div>

        {/* Inner Counter-Rotating Ring */}
        <div className="absolute w-10 h-10 rounded-full border-2 border-slate-800 border-b-cyan-400 border-l-cyan-300 animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>

        {/* Center Camera Icon */}
        <div className="absolute flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5 animate-pulse text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <h3 className="text-lg font-semibold text-slate-100 mb-1 flex items-center gap-2">
        Fetching Photos
        <span className="flex space-x-1">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
        </span>
      </h3>
      <p className="text-sm text-slate-400 max-w-sm text-center">
        Connecting to Picsum Photos API to load 30 high-resolution photos...
      </p>

      {/* Visual Skeleton Placeholder Preview */}
      <div className="mt-12 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-40">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg animate-pulse"
          >
            <div className="h-48 bg-slate-800/80"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
