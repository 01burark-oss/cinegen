
import React, { useState } from 'react';
import {
  Search, Wand2, X, Star, Radar, Info,
  LayoutDashboard, Compass, Layers, Filter,
  BookmarkPlus, Bookmark, Ban, Brain, Award,
  Monitor, Calendar, ExternalLink, Languages, Loader2,
  ChevronLeft, SlidersHorizontal, CheckCircle2, Film, Sparkles
} from 'lucide-react';
import { Recommendation } from '../types';
import { RecommenderService } from '../services/gemini';
import { CineGenLogo } from '../App';

const TmdbIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.24 81.52">
    <defs>
      <linearGradient id="tmdb_grad_mobile" y1="40.76" x2="190.24" y2="40.76" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#90cea1"/>
        <stop offset="0.56" stopColor="#3cbec9"/>
        <stop offset="1" stopColor="#00b3e5"/>
      </linearGradient>
    </defs>
    <path fill="url(#tmdb_grad_mobile)" d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67ZM145,68.6A8.8,8.8,0,0,1,142.36,72a10.7,10.7,0,0,1-4,1.82,21.57,21.57,0,0,1-5,.55h-4.05v-21h4.6a17,17,0,0,1,4.67.63,11.66,11.66,0,0,1,3.88,1.87A9.14,9.14,0,0,1,145,59a9.87,9.87,0,0,1,1,4.52A11.89,11.89,0,0,1,145,68.6Zm44.63-.13a8,8,0,0,0-1.58-2.62A8.38,8.38,0,0,0,185.63,64a10.31,10.31,0,0,0-3.17-1v-.1a9.22,9.22,0,0,0,4.42-2.82,7.43,7.43,0,0,0,1.68-5,8.42,8.42,0,0,0-1.15-4.65,8.09,8.09,0,0,0-3-2.72,12.56,12.56,0,0,0-4.18-1.3,32.84,32.84,0,0,0-4.62-.33h-13.2v35.4h14.5a22.41,22.41,0,0,0,4.72-.5,13.53,13.53,0,0,0,4.28-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68A9.39,9.39,0,0,0,189.66,68.47ZM170.21,52.72h5.3a10,10,0,0,1,1.85.18,6.18,6.18,0,0,1,1.7.57,3.39,3.39,0,0,1,1.22,1.13,3.22,3.22,0,0,1,.48,1.82,3.63,3.63,0,0,1-.43,1.8,3.4,3.4,0,0,1-1.12,1.2,4.92,4.92,0,0,1-1.58.65,7.51,7.51,0,0,1-1.77.2h-5.65Zm11.72,20a3.9,3.9,0,0,1-1.22,1.3,4.64,4.64,0,0,1-1.68.7,8.18,8.18,0,0,1-1.82.2h-7v-8h5.9a15.35,15.35,0,0,1,2,.15,8.47,8.47,0,0,1,2.05.55,4,4,0,0,1,1.57,1.18,3.11,3.11,0,0,1,.63,2A3.71,3.71,0,0,1,181.93,72.72Z"/>
  </svg>
);

const RadarChart: React.FC<{ scores: Recommendation['scores'], t: any, size?: number }> = ({ scores, t, size = 180 }) => {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const pointsCount = 5;
  const labels = [
    { key: 'depth', label: t.radar_depth },
    { key: 'visuals', label: t.radar_visuals },
    { key: 'acting', label: t.radar_acting },
    { key: 'pacing', label: t.radar_pacing },
    { key: 'originality', label: t.radar_originality },
  ];
  const getPoint = (index: number, value: number, maxRadius: number) => {
    const angle = (index * 2 * Math.PI) / pointsCount - Math.PI / 2;
    const r = (value / 10) * maxRadius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const scorePoints = labels.map((l, i) => {
    const val = (scores as any)[l.key] || 0;
    const p = getPoint(i, val, radius); return `${p.x},${p.y}`;
  }).join(' ');
  return (
    <div className="relative inline-flex flex-col items-center pointer-events-none">
      <svg width={size} height={size} className="overflow-visible">
        {Array.from({ length: 5 }).map((_, idx) => (
          <polygon key={idx} points={Array.from({ length: 5 }).map((_, i) => {
            const p = getPoint(i, 10, radius * (0.2 * (idx + 1))); return `${p.x},${p.y}`;
          }).join(' ')} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <polygon points={scorePoints} fill="rgba(90, 74, 244, 0.3)" stroke="rgb(90, 74, 244)" strokeWidth="2" />
      </svg>
    </div>
  );
};

const PrecisionRatingMobile: React.FC<{ rating: number; onRate: (val: number) => void; t: any }> = ({ rating, onRate, t }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayValue = hoverRating || rating;
  return (
    <div className="space-y-4 mt-8 flex flex-col items-center">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{t.rating_label}</p>
      <div className="flex items-center gap-0 select-none">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <div key={starIndex} className="relative w-12 h-12 flex items-center justify-center transition-transform active:scale-90"
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const touchX = (e as any).clientX || (e as any).touches?.[0]?.clientX;
              const isLeft = touchX - left < width / 2;
              const newValue = isLeft ? starIndex * 2 - 1 : starIndex * 2;
              onRate(rating === newValue ? 0 : newValue);
            }}
          >
            <Star size={32} className={`absolute transition-colors ${displayValue >= starIndex * 2 ? 'text-yellow-500 fill-yellow-500' : displayValue >= starIndex * 2 - 1 ? 'text-zinc-700' : 'text-zinc-800'}`} />
            {displayValue === starIndex * 2 - 1 && (
              <Star size={32} className="absolute text-yellow-500 fill-yellow-500 star-half-left" />
            )}
          </div>
        ))}
      </div>
      {displayValue > 0 && <span className="text-3xl font-black italic text-yellow-500">{(displayValue / 2).toFixed(1)}</span>}
    </div>
  );
};

const DescriptionBoxMobile: React.FC<{ text: string; t: any }> = ({ text, t }) => {
  const [displayMode, setDisplayMode] = useState<'ORIGINAL' | 'TRANSLATED'>('ORIGINAL');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (displayMode === 'ORIGINAL') {
      if (!translatedText) {
        setIsTranslating(true);
        const result = await RecommenderService.translateDescription(text);
        if (result) setTranslatedText(result);
        setIsTranslating(false);
      }
      setDisplayMode('TRANSLATED');
    } else { setDisplayMode('ORIGINAL'); }
  };

  return (
    <div className="space-y-4">
      <p className="text-zinc-300 text-sm leading-relaxed italic border-l-2 border-[#5A4AF4]/30 pl-4">
        {displayMode === 'TRANSLATED' && translatedText ? translatedText : text}
      </p>
      <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#5A4AF4] active:text-white transition-colors disabled:opacity-50">
        {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
        {isTranslating ? t.translating_label : (displayMode === 'ORIGINAL' ? t.translate_btn : t.revert_btn)}
      </button>
    </div>
  );
};

const MovieCardMobile: React.FC<{ 
  item: any; onShowDetails: (item: any) => void; isWatchlisted: boolean; userRating: number;
}> = ({ item, onShowDetails, isWatchlisted, userRating }) => (
  <div onClick={() => onShowDetails(item)} className="relative aspect-[2/3] bg-[#121317] rounded-sm overflow-hidden shadow-xl border border-white/5 active:scale-95 transition-all">
    {item.poster_path ? (
      <img 
        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
        className="w-full h-full object-cover" 
        alt={item.name || item.title || 'Poster'}
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect fill="%23121317" width="500" height="750"/></svg>';
        }}
      />
    ) : (
      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
        <span className="text-zinc-600 text-xs">No Poster</span>
      </div>
    )}
    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-1 rounded text-[10px] font-black text-yellow-500 flex items-center gap-1 z-20">
      <Star size={10} fill="currentColor" /> {(item.vote_average?.toFixed(1) || item.imdb_rating || '0.0')}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-3">
       <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-white truncate italic tracking-tighter">{item.name || item.title}</p>
          {isWatchlisted && <Bookmark size={12} className="text-[#5A4AF4] fill-[#5A4AF4] ml-2" />}
       </div>
    </div>
  </div>
);

const MobileLayout: React.FC<any> = ({ states, handlers, t, onSwitchToDesktop }) => {
  const {
    activeTab, libraryTab, ratedSeries, watchList, aiSuggestions, recommendations,
    catalogShows, genres, selectedGenreId, minImdb, isLoading, isCatalogLoading, analyzingBackdrop, searchQuery, searchResults,
    selectedShow, isFilterOpen, isUnderratedOnly
  } = states;

  const {
    setActiveTab, setLibraryTab, setSeedShow, handleGenerate, handleRate,
    handleSearch, setSelectedShow, setCatalogPage, handleBlock, handleToggleWatchlist,
    setSelectedGenreId, setIsFilterOpen, setLang, setMinImdb, setIsUnderratedOnly
  } = handlers;

  // Infinite scroll ref
  const catalogEndRef = React.useRef<HTMLDivElement>(null);

  // Infinite scroll logic
  React.useEffect(() => {
    if (activeTab !== 'CATALOG') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCatalogPage((prev: number) => prev + 2); // Load 2 pages at a time (40 items)
        }
      },
      { threshold: 1.0 }
    );

    if (catalogEndRef.current) {
      observer.observe(catalogEndRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, setCatalogPage]);

  const getMovieProps = (movie: any) => {
    const id = movie.tmdb_id || movie.id;
    return {
      isWatchlisted: watchList.some((w: any) => String(w.tmdb_id) === String(id)),
      userRating: ratedSeries.find((r: any) => String(r.tmdb_id) === String(id))?.rating || 0,
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] text-[#e5e5e5] font-sans">
      {/* Immersive Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0c10] flex flex-col items-center justify-center animate-in fade-in duration-500">
           {analyzingBackdrop && (
             <div className="absolute inset-0 z-0">
               <img 
                 src={`https://image.tmdb.org/t/p/original${analyzingBackdrop}`} 
                 className="w-full h-full object-cover blur-2xl opacity-40 animate-pulse scale-110" 
                 alt="" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-[#0a0c10]" />
             </div>
           )}
           <div className="relative z-10 flex flex-col items-center">
             <div className="relative mb-8">
                <div className="w-20 h-20 border-3 border-[#5A4AF4]/20 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-t-3 border-[#5A4AF4] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Radar className="text-[#5A4AF4] animate-pulse" size={24} />
                </div>
             </div>
             <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white animate-pulse drop-shadow-xl">SYNTHESIZING...</h3>
             <p className="mt-4 text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400">Deep Neural Mapping Active</p>
           </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full bg-[#121317]/90 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CineGenLogo className="w-8 h-8" />
          <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">CINE_GEN<span className="text-[#5A4AF4]">.</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900/50 p-1 rounded-lg border border-white/5">
            <button onClick={() => setLang('EN')} className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${states.lang === 'EN' ? 'bg-white text-black' : 'text-zinc-500'}`}>EN</button>
            <button onClick={() => setLang('TR')} className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${states.lang === 'TR' ? 'bg-white text-black' : 'text-zinc-500'}`}>TR</button>
          </div>
          <button onClick={onSwitchToDesktop} className="w-8 h-8 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-white/5 text-zinc-400"><Monitor size={16} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scroll pb-32">
        {activeTab === 'DISCOVERY' ? (
          <div className="animate-in fade-in p-6 space-y-10">
             <div className="space-y-4 bg-[#121317] p-8 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black text-[#5A4AF4] tracking-[0.4em] uppercase text-center">{t.active_seed}</p>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                   <input className="text-lg font-black bg-zinc-900/50 border border-white/5 focus:border-[#5A4AF4] focus:outline-none w-full py-4 pl-12 pr-4 rounded-xl text-white shadow-inner" placeholder={t.placeholder_seed} value={states.seedShow} onChange={(e)=>setSeedShow(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleGenerate()} />
                </div>
                <div className="space-y-6">
                   {/* Setting Container: IMDb & Underrated */}
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-zinc-500">
                           <div className="flex items-center gap-2">
                              <SlidersHorizontal size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">{t.min_imdb_label}</span>
                           </div>
                           <span className="text-lg font-black text-[#5A4AF4]">{minImdb.toFixed(1)}</span>
                        </div>
                        <div className="relative h-10 flex items-center">
                           <input 
                             type="range" 
                             min="6.0" 
                             max="9.5" 
                             step="0.1" 
                             value={minImdb} 
                             onChange={(e)=>setMinImdb(parseFloat(e.target.value))} 
                             className="z-10"
                           />
                           <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                              {[6.0, 7.0, 8.0, 9.0].map(val => (
                                <div key={val} className="flex flex-col items-center gap-1">
                                  <div className="w-0.5 h-1 bg-zinc-800"></div>
                                  <span className="text-[8px] font-black text-zinc-700">{val.toFixed(0)}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setIsUnderratedOnly(!isUnderratedOnly)}
                        className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-white/5 active:scale-95 transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <Sparkles size={16} className={isUnderratedOnly ? "text-[#5A4AF4]" : "text-zinc-600"} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.underrated_label}</span>
                         </div>
                         <button 
                           className={`relative w-10 h-5 rounded-full transition-all ${isUnderratedOnly ? 'bg-[#5A4AF4]' : 'bg-zinc-800'}`}
                         >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isUnderratedOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </button>
                      </div>
                   </div>

                   <button onClick={() => handleGenerate()} disabled={isLoading} className="w-full h-16 flex items-center justify-center gap-4 bg-[#5A4AF4] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">
                     <Radar size={20} />
                     {t.run_analysis}
                   </button>
                </div>
             </div>
             
             {recommendations.length > 0 && (
                <div className="space-y-6">
                   <h3 className="text-[11px] font-black uppercase text-zinc-600 tracking-widest pl-2">RESULTS FOR YOU</h3>
                   <div className="grid grid-cols-2 gap-4">
                     {recommendations.map((rec: any) => <MovieCardMobile key={rec.id} item={rec} onShowDetails={setSelectedShow} {...getMovieProps(rec)} />)}
                   </div>
                </div>
             )}
          </div>
        ) : activeTab === 'DASHBOARD' ? (
          <div className="p-6 space-y-6">
            <div className="flex bg-[#121317] p-1 rounded-xl border border-white/5 sticky top-2 z-30 backdrop-blur-xl">
              <button onClick={() => setLibraryTab('SUGGESTIONS')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${libraryTab === 'SUGGESTIONS' ? 'bg-[#5A4AF4] text-white shadow-lg' : 'text-zinc-500'}`}>{(t.tab_suggestions || 'AI').split(' ')[0]}</button>
              <button onClick={() => setLibraryTab('WATCHLIST')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${libraryTab === 'WATCHLIST' ? 'bg-[#5A4AF4] text-white shadow-lg' : 'text-zinc-500'}`}>{(t.tab_watchlist || 'Watch').split(' ')[0]}</button>
              <button onClick={() => setLibraryTab('RATED')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${libraryTab === 'RATED' ? 'bg-[#5A4AF4] text-white shadow-lg' : 'text-zinc-500'}`}>{(t.tab_rated || 'Rated').split(' ')[0]}</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {libraryTab === 'SUGGESTIONS' && aiSuggestions.map((s:any)=><MovieCardMobile key={s.tmdb_id} item={s} onShowDetails={setSelectedShow} {...getMovieProps(s)}/>)}
              {libraryTab === 'WATCHLIST' && watchList.map((s:any)=><MovieCardMobile key={s.tmdb_id} item={s} onShowDetails={setSelectedShow} {...getMovieProps(s)}/>)}
              {libraryTab === 'RATED' && ratedSeries.map((s:any)=><MovieCardMobile key={s.tmdb_id} item={s} onShowDetails={setSelectedShow} {...getMovieProps(s)}/>)}
            </div>
          </div>
        ) : activeTab === 'CATALOG' ? (
          <div className="p-6 space-y-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black uppercase text-zinc-500 italic tracking-tighter">{t.catalog_title}</h3>
                <button onClick={() => setIsFilterOpen(true)} className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-400 flex items-center gap-2 text-[10px] font-black uppercase"><Filter size={14} /> {t.filter_btn}</button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {catalogShows.map((show: any) => <MovieCardMobile key={show.id} item={show} onShowDetails={setSelectedShow} {...getMovieProps(show)} />)}
             </div>

             {/* Loading indicator for catalog */}
             {isCatalogLoading && (
               <div className="flex justify-center items-center py-6">
                 <div className="flex items-center gap-3 text-zinc-400">
                   <div className="w-5 h-5 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin"></div>
                   <span className="text-xs font-medium">Loading more series...</span>
                 </div>
               </div>
             )}

             {/* Infinite scroll trigger - invisible element at the bottom */}
             <div ref={catalogEndRef} className="h-4" />
          </div>
        ) : activeTab === 'SEARCH' ? (
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
              <input className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-black italic uppercase text-white focus:outline-none focus:border-[#5A4AF4]" placeholder={t.search_hint} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {searchResults.map((res: any) => <MovieCardMobile key={res.id} item={res} onShowDetails={setSelectedShow} {...getMovieProps(res)} />)}
            </div>
          </div>
        ) : null}
      </main>

      {selectedShow && (
        <div className="fixed inset-0 z-[100] bg-[#0a0c10] flex flex-col animate-in slide-in-from-bottom-full overflow-hidden">
          <div className="flex-none h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#121317]/90 backdrop-blur-xl sticky top-0 z-[101]">
            <button onClick={() => setSelectedShow(null)} className="p-2 -ml-2 text-zinc-400 active:text-white"><ChevronLeft size={28} /></button>
            <h2 className="text-sm font-black uppercase italic tracking-tighter text-white truncate max-w-[60%] tracking-tighter">{selectedShow.name || selectedShow.title}</h2>
            <button onClick={() => window.open('https://www.themoviedb.org/tv/' + (selectedShow.tmdb_id || selectedShow.id), '_blank')} className="p-2 text-[#5A4AF4]"><ExternalLink size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll pb-32">
            <div className="relative aspect-[4/5] w-full">
              {selectedShow.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/original${selectedShow.poster_path}`} 
                  className="w-full h-full object-cover" 
                  alt={selectedShow.name || selectedShow.title || 'Poster'}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect fill="%23121317" width="500" height="750"/></svg>';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-zinc-600 text-xs">No Poster</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Calendar size={12} className="text-[#5A4AF4]" /> {(selectedShow.first_air_date || '').split('-')[0] || 'N/A'}</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {(selectedShow.vote_average || selectedShow.imdb_rating || '0.0')} / 10</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-[#5A4AF4] tracking-[0.3em] uppercase"><Info size={14} /> {t.reasoning_label}</div>
                 <DescriptionBoxMobile text={selectedShow.reasoning || selectedShow.overview || 'Description not synthesized.'} t={t} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleToggleWatchlist(selectedShow)} className={`h-16 flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all ${watchList.some((w: any) => String(w.tmdb_id) === String(selectedShow.id || selectedShow.tmdb_id)) ? 'bg-[#5A4AF4] border-[#5A4AF4] text-white shadow-lg shadow-[#5A4AF4]/20' : 'bg-white/5 border-white/10 text-zinc-500'}`}><Bookmark size={18} fill={watchList.some((w: any) => String(w.tmdb_id) === String(selectedShow.id || selectedShow.tmdb_id)) ? "currentColor" : "none"}/><span className="text-[8px] font-black uppercase tracking-widest">LİSTELE</span></button>
                <button onClick={() => handleBlock(selectedShow)} className="h-16 flex flex-col items-center justify-center gap-1 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-500/80 transition-all"><Ban size={18} /><span className="text-[8px] font-black uppercase tracking-widest">KALDIR</span></button>
                <button onClick={() => window.open('https://www.themoviedb.org/tv/' + (selectedShow.tmdb_id || selectedShow.id), '_blank')} className="h-16 flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 active:bg-white/10 transition-all"><TmdbIcon className="w-8 h-auto opacity-60" /><span className="text-[8px] font-black uppercase tracking-widest">TMDB</span></button>
                <button onClick={() => handleGenerate(selectedShow.name || selectedShow.title, selectedShow.poster_path)} className="h-16 flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#5A4AF4] active:scale-95 transition-all text-white border border-[#5A4AF4] shadow-xl shadow-[#5A4AF4]/30"><Wand2 size={18} /><span className="text-[8px] font-black uppercase tracking-widest">ANALİZ</span></button>
              </div>

              <PrecisionRatingMobile 
                rating={ratedSeries.find((r: any) => String(r.tmdb_id) === String((selectedShow.tmdb_id || selectedShow.id)))?.rating || 0} 
                onRate={(val) => handleRate(selectedShow, val)}
                t={t}
              />

              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-6">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">NARRATIVE DNA</h4>
                  <RadarChart scores={selectedShow.scores || {depth:5,visuals:5,acting:5,pacing:5,originality:5}} t={t} size={240} />
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#121317]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around z-50 px-2 shadow-2xl">
        {[
          { id: 'DASHBOARD', icon: LayoutDashboard, label: t.nav_dashboard },
          { id: 'DISCOVERY', icon: Compass, label: t.nav_discovery },
          { id: 'CATALOG', icon: Layers, label: t.nav_catalog },
          { id: 'SEARCH', icon: Search, label: t.nav_search },
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-all ${activeTab === item.id ? 'text-[#5A4AF4]' : 'text-zinc-600'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#5A4AF4]/10' : 'hover:bg-white/5'}`}><item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} /></div>
            <span className="text-[7.5px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </footer>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-end" onClick={() => setIsFilterOpen(false)}>
           <div className="w-full bg-[#121317] border-t border-white/5 rounded-t-3xl p-10 space-y-8 animate-in slide-in-from-bottom-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-widest text-white italic">Discovery Filter</h3><button onClick={() => setIsFilterOpen(false)} className="p-2 text-zinc-500"><X size={24}/></button></div>
              <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto custom-scroll pr-2">
                 <button onClick={() => { setSelectedGenreId(null); setCatalogPage(1); setIsFilterOpen(false); }} className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase text-left transition-all ${!states.selectedGenreId ? 'bg-[#5A4AF4] text-white' : 'bg-zinc-900 text-zinc-500'}`}>{t.genre_all}</button>
                 {genres?.map((g: any) => (
                    <button key={g.id} onClick={() => { setSelectedGenreId(g.id); setCatalogPage(1); setIsFilterOpen(false); }} className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase text-left transition-all truncate ${states.selectedGenreId === g.id ? 'bg-[#5A4AF4] text-white' : 'bg-white/5 text-zinc-500'}`}>{g.name}</button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
