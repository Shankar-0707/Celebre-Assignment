
const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="w-full flex items-center justify-center py-6 sm:py-10 px-4">
      <div className="max-w-md w-full bg-slate-900/95 backdrop-blur-md border border-rose-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-rose-950/20 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Warning Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-inner">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Heading & Details */}
        <h3 className="text-xl font-bold text-white mb-2">Failed to Fetch Photos</h3>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          We encountered an issue while communicating with the Picsum Photos API.
        </p>

        {/* Error Details Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 mb-6 text-left">
          <p className="text-xs font-mono text-rose-400 break-words">
            <span className="font-semibold text-rose-300">Error: </span>
            {error || 'Network request failed. Please check your internet connection or try again.'}
          </p>
        </div>

        {/* Retry Button */}
        <button
          id="retry-fetch-btn"
          onClick={onRetry}
          type="button"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <svg className="w-4 h-4 animate-spin-reverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
