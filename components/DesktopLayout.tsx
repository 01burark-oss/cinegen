
import React, { useRef, useState } from 'react';
import { Recommendation } from '../types';
import { RecommenderService } from '../services/gemini';
import { 
  Search, Wand2, X, Star, Radar, Info, 
  LayoutDashboard, Compass, Layers, Menu, Filter,
  Bookmark, Ban, Monitor, Calendar, ExternalLink, 
  Languages, Loader2, SlidersHorizontal, Smartphone, Sparkles
} from 'lucide-react';

const TmdbIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.24 81.52">
    <defs>
      <linearGradient id="tmdb_grad" y1="40.76" x2="190.24" y2="40.76" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#90cea1"/>
        <stop offset="0.56" stopColor="#3cbec9"/>
        <stop offset="1" stopColor="#00b3e5"/>
      </linearGradient>
    </defs>
    <path fill="url(#tmdb_grad)" d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67ZM145,68.6A8.8,8.8,0,0,1,142.36,72a10.7,10.7,0,0,1-4,1.82,21.57,21.57,0,0,1-5,.55h-4.05v-21h4.6a17,17,0,0,1,4.67.63,11.66,11.66,0,0,1,3.88,1.87A9.14,9.14,0,0,1,145,59a9.87,9.87,0,0,1,1,4.52A11.89,11.89,0,0,1,145,68.6Zm44.63-.13a8,8,0,0,0-1.58-2.62A8.38,8.38,0,0,0,185.63,64a10.31,10.31,0,0,0-3.17-1v-.1a9.22,9.22,0,0,0,4.42-2.82,7.43,7.43,0,0,0,1.68-5,8.42,8.42,0,0,0-1.15-4.65,8.09,8.09,0,0,0-3-2.72,12.56,12.56,0,0,0-4.18-1.3,32.84,32.84,0,0,0-4.62-.33h-13.2v35.4h14.5a22.41,22.41,0,0,0,4.72-.5,13.53,13.53,0,0,0,4.28-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68A9.39,9.39,0,0,0,189.66,68.47ZM170.21,52.72h5.3a10,10,0,0,1,1.85.18,6.18,6.18,0,0,1,1.7.57,3.39,3.39,0,0,1,1.22,1.13,3.22,3.22,0,0,1,.48,1.82,3.63,3.63,0,0,1-.43,1.8,3.4,3.4,0,0,1-1.12,1.2,4.92,4.92,0,0,1-1.58.65,7.51,7.51,0,0,1-1.77.2h-5.65Zm11.72,20a3.9,3.9,0,0,1-1.22,1.3,4.64,4.64,0,0,1-1.68.7,8.18,8.18,0,0,1-1.82.2h-7v-8h5.9a15.35,15.35,0,0,1,2,.15,8.47,8.47,0,0,1,2.05.55,4,4,0,0,1,1.57,1.18,3.11,3.11,0,0,1,.63,2A3.71,3.71,0,0,1,181.93,72.72Z"/>
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
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const bgPolygons = levels.map((lvl) => Array.from({ length: pointsCount }).map((_, i) => {
    const p = getPoint(i, 10, radius * lvl); return `${p.x},${p.y}`;
  }).join(' '));
  const scorePoints = labels.map((l, i) => {
    const val = (scores as any)[l.key] || 0;
    const p = getPoint(i, val, radius); return `${p.x},${p.y}`;
  }).join(' ');
  return (
    <div className="relative inline-flex flex-col items-center pointer-events-none">
      <svg width={size} height={size} className="overflow-visible">
        {bgPolygons.map((points, idx) => <polygon key={idx} points={points} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
        {Array.from({ length: pointsCount }).map((_, i) => {
          const p = getPoint(i, 10, radius); return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
        })}
        <polygon points={scorePoints} fill="rgba(90, 74, 244, 0.3)" stroke="rgb(90, 74, 244)" strokeWidth="2" className="transition-all duration-1000" />
        {labels.map((l, i) => {
          const p = getPoint(i, 10, radius + 15);
          return <text key={i} x={p.x} y={p.y} textAnchor="middle" className="fill-zinc-600 text-[8px] font-black uppercase tracking-tighter">{l.label}</text>;
        })}
      </svg>
    </div>
  );
};

const PrecisionRating: React.FC<{ rating: number; onRate: (val: number) => void; t: any }> = ({ rating, onRate, t }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayValue = hoverRating || rating;
  return (
    <div className="space-y-4 mt-8 flex flex-col items-center">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{t.rating_label}</p>
      <div className="flex items-center gap-1 select-none">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <div key={starIndex} className="relative w-8 h-8 cursor-pointer flex items-center justify-center transition-transform active:scale-90"
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - left;
              const isLeft = clickX < width / 2;
              const newValue = isLeft ? starIndex * 2 - 1 : starIndex * 2;
              onRate(rating === newValue ? 0 : newValue);
            }}
            onMouseEnter={() => setHoverRating(starIndex * 2)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star size={24} className={`absolute transition-colors ${displayValue >= starIndex * 2 ? 'text-yellow-500 fill-yellow-500' : displayValue >= starIndex * 2 - 1 ? 'text-zinc-700' : 'text-zinc-800'}`} />
            {displayValue === starIndex * 2 - 1 && (
              <Star size={24} className="absolute text-yellow-500 fill-yellow-500 star-half-left" />
            )}
          </div>
        ))}
      </div>
      {displayValue > 0 && <span className="text-2xl font-black italic text-yellow-500">{(displayValue / 2).toFixed(1)}</span>}
    </div>
  );
};

const DescriptionBox: React.FC<{ text: string; t: any }> = ({ text, t }) => {
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
      <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-[#5A4AF4]/20 pl-4">
        {displayMode === 'TRANSLATED' && translatedText ? translatedText : text}
      </p>
      <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#5A4AF4] hover:text-white transition-colors disabled:opacity-50">
        {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
        {isTranslating ? t.translating_label : (displayMode === 'ORIGINAL' ? t.translate_btn : t.revert_btn)}
      </button>
    </div>
  );
};

const MovieCard: React.FC<{ 
  item: any; onShowDetails: (item: any) => void; 
  onToggleWatchlist: () => void; isWatchlisted: boolean; userRating: number;
}> = ({ item, onShowDetails, onToggleWatchlist, isWatchlisted, userRating }) => (
  <div className="flex flex-col gap-3 group/card w-full animate-in fade-in">
    <div onClick={() => onShowDetails(item)} className="relative aspect-[2/3] bg-[#121317] rounded-sm overflow-hidden group/poster shadow-2xl transition-all hover:scale-105 cursor-pointer ring-1 ring-white/5">
      <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-full h-full object-cover" alt="" />
      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-yellow-500 flex items-center gap-1 z-20">
        <Star size={10} fill="currentColor" /> {(item.vote_average?.toFixed(1) || item.imdb_rating || '0.0')}
      </div>
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-all z-30 flex flex-col justify-end p-4">
        <div className="text-[11px] font-black uppercase text-white truncate drop-shadow-lg">{item.name || item.title}</div>
      </div>
      <div className="absolute top-2 left-2 z-40">
        <button onClick={(e) => { e.stopPropagation(); onToggleWatchlist(); }} className={`p-2 rounded-lg backdrop-blur-md border transition-all ${isWatchlisted ? 'bg-[#5A4AF4] border-[#5A4AF4] text-white' : 'bg-black/60 border-white/10 text-white hover:bg-[#5A4AF4] opacity-0 group-hover/poster:opacity-100'}`}>
          <Bookmark size={14} fill={isWatchlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  </div>
);

const DesktopLayout: React.FC<any> = ({ states, handlers, t, onSwitchToMobile }) => {
  const { 
    activeTab, libraryTab, ratedSeries, watchList, aiSuggestions, recommendations, 
    catalogShows, isLoading, analyzingBackdrop, searchQuery, searchResults, selectedShow, selectedShowDetails, minImdb, isFilterOpen, isUnderratedOnly
  } = states;

  const { 
    setActiveTab, setLibraryTab, setSeedShow, handleGenerate, handleRate, 
    handleSearch, setSelectedShow, setCatalogPage, handleBlock, handleToggleWatchlist, setLang, setMinImdb, setIsFilterOpen, setSelectedGenreId, setIsUnderratedOnly
  } = handlers;

  const getMovieProps = (movie: any) => {
    const showId = movie.tmdb_id || movie.id;
    return {
      isWatchlisted: watchList.some((w: any) => String(w.tmdb_id) === String(showId)),
      userRating: ratedSeries.find((r: any) => String(r.tmdb_id) === String(showId))?.rating || 0,
      onToggleWatchlist: () => handleToggleWatchlist(movie)
    };
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#e5e5e5] flex flex-row font-sans">
      {/* Immersive Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0c10] flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
          {analyzingBackdrop && (
            <div className="absolute inset-0 z-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${analyzingBackdrop}`} 
                className="w-full h-full object-cover blur-3xl opacity-40 scale-110 animate-pulse" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-[#0a0c10]" />
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-12">
               <div className="w-32 h-32 border-4 border-[#5A4AF4]/20 rounded-full" />
               <div className="absolute inset-0 w-32 h-32 border-t-4 border-[#5A4AF4] rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Radar className="text-[#5A4AF4] animate-pulse" size={48} />
               </div>
            </div>
            <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white animate-pulse drop-shadow-2xl">SYNTHESIZING...</h3>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.6em] text-indigo-400 drop-shadow-md">Deep Neural Mapping Active</p>
          </div>
        </div>
      )}

      <aside className="fixed left-0 top-0 h-full w-20 hover:w-64 bg-[#121317]/60 backdrop-blur-3xl border-r border-white/5 z-[300] transition-all duration-300 group flex flex-col items-center py-8">
        <div className="mb-12 flex items-center gap-4 px-6 w-full">
          <div className="w-8 h-8 flex-none bg-[#5A4AF4] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#5A4AF4]/20"><Menu size={20} /></div>
          <span className="text-xl font-black italic uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity tracking-tighter">{t.title}</span>
        </div>
        <nav className="flex-1 w-full space-y-2 px-4">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: t.nav_dashboard },
            { id: 'DISCOVERY', icon: Compass, label: t.nav_discovery },
            { id: 'CATALOG', icon: Layers, label: t.nav_catalog },
            { id: 'SEARCH', icon: Search, label: t.nav_search },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#5A4AF4]/20 text-[#5A4AF4]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}`}>
              <item.icon size={26} className="flex-none" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onSwitchToMobile} className="p-4 text-zinc-600 hover:text-white transition-colors mb-4"><Smartphone size={24} /></button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 ml-20">
        <header className="sticky top-0 z-40 w-full bg-[#121317]/80 backdrop-blur-md border-b border-white/5 px-12 py-6 flex items-center justify-between">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{t['nav_' + activeTab.toLowerCase()] || t.title}</h2>
          <div className="flex items-center gap-4">
             {activeTab === 'DASHBOARD' && (
               <div className="flex bg-[#121317] p-1 rounded-xl border border-white/5">
                 <button onClick={() => setLibraryTab('SUGGESTIONS')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === 'SUGGESTIONS' ? 'bg-[#5A4AF4] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.tab_suggestions}</button>
                 <button onClick={() => setLibraryTab('WATCHLIST')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === 'WATCHLIST' ? 'bg-[#5A4AF4] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.tab_watchlist}</button>
                 <button onClick={() => setLibraryTab('RATED')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === 'RATED' ? 'bg-[#5A4AF4] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.tab_rated}</button>
               </div>
             )}
             <div className="flex items-center bg-[#121317] p-1 rounded-xl border border-white/5">
                <button onClick={() => setLang('EN')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${states.lang === 'EN' ? 'bg-white text-black' : 'text-zinc-500'}`}>EN</button>
                <button onClick={() => setLang('TR')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${states.lang === 'TR' ? 'bg-white text-black' : 'text-zinc-500'}`}>TR</button>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scroll p-12 bg-[#121317]/10">
           {activeTab === 'DISCOVERY' ? (
             <div className="flex flex-col items-center py-10 max-w-7xl mx-auto space-y-16">
                <div className="w-full bg-[#121317] border border-white/5 rounded-3xl p-16 shadow-2xl">
                   <div className="space-y-4 text-center">
                      <p className="text-[11px] font-black text-[#5A4AF4] tracking-[0.4em] uppercase">{t.active_seed}</p>
                      <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={28} />
                        <input 
                          className="text-4xl font-black text-center bg-zinc-900/50 border border-white/5 focus:border-[#5A4AF4] focus:outline-none w-full py-8 pl-16 pr-8 placeholder:text-zinc-800 uppercase italic tracking-tighter transition-all rounded-2xl text-white shadow-inner"
                          placeholder={t.placeholder_seed}
                          value={states.seedShow}
                          onChange={(e) => setSeedShow(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                      </div>
                   </div>
                   <div className="flex flex-col items-center mt-12 gap-8">
                      <div className="w-full max-w-xl space-y-8">
                        {/* IMDb Slider */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-zinc-500">
                             <div className="flex items-center gap-2">
                                <SlidersHorizontal size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t.min_imdb_label}</span>
                             </div>
                             <span className="text-xl font-black text-[#5A4AF4]">{minImdb.toFixed(1)}</span>
                          </div>
                          <div className="relative h-10 flex items-center">
                             <input 
                               type="range" 
                               min="6.0" 
                               max="9.5" 
                               step="0.1" 
                               value={minImdb} 
                               onChange={(e) => setMinImdb(parseFloat(e.target.value))} 
                               className="z-10"
                             />
                             <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                                {[6.0, 7.0, 8.0, 9.0].map(val => (
                                  <div key={val} className="flex flex-col items-center gap-1">
                                    <div className="w-0.5 h-1.5 bg-zinc-800"></div>
                                    <span className="text-[9px] font-black text-zinc-700">{val.toFixed(0)}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        </div>

                        {/* Underrated Only Toggle */}
                        <div className="flex items-center justify-between bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-3">
                              <Sparkles size={18} className={isUnderratedOnly ? "text-[#5A4AF4]" : "text-zinc-600"} />
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">{t.underrated_label}</span>
                                 <span className="text-[9px] text-zinc-600 uppercase font-medium">Focus on hidden gems</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => setIsUnderratedOnly(!isUnderratedOnly)}
                             className={`relative w-12 h-6 rounded-full transition-all ${isUnderratedOnly ? 'bg-[#5A4AF4]' : 'bg-zinc-800'}`}
                           >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isUnderratedOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                      </div>

                      <button onClick={() => handleGenerate()} disabled={isLoading} className="px-20 py-6 bg-[#5A4AF4] hover:bg-[#4d3ee0] text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-[#5A4AF4]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                        <Radar size={22} className="animate-pulse" />
                        {t.run_analysis}
                      </button>
                   </div>
                </div>

                {recommendations.length > 0 && (
                  <div className="w-full space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="h-1 w-8 bg-[#5A4AF4] rounded-full"></div>
                       <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-500">ENGINE SELECTIONS</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-8 animate-in slide-in-from-bottom-10 duration-500">
                      {recommendations.map((rec: any) => <MovieCard key={rec.id} item={rec} onShowDetails={setSelectedShow} {...getMovieProps(rec)} />)}
                    </div>
                  </div>
                )}
             </div>
           ) : activeTab === 'CATALOG' ? (
             <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{t.catalog_title}</h3>
                   <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-6 py-3 bg-[#121317] rounded-xl border border-white/10 text-zinc-400 hover:text-white flex items-center gap-3 transition-all">
                     <Filter size={18} /> <span className="text-xs font-black uppercase tracking-widest">{t.filter_btn}</span>
                   </button>
                </div>
                <div className="grid grid-cols-6 gap-8">
                   {catalogShows.map((show: any) => <MovieCard key={show.id} item={show} onShowDetails={setSelectedShow} {...getMovieProps(show)} />)}
                </div>
             </div>
           ) : activeTab === 'SEARCH' ? (
             <div className="space-y-12">
               <div className="relative max-w-4xl mx-auto bg-[#121317] p-8 rounded-3xl border border-white/5 shadow-2xl">
                 <Search className="absolute left-14 top-1/2 -translate-y-1/2 text-zinc-700" size={32} />
                 <input className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-8 pl-24 pr-8 text-2xl font-black italic uppercase text-white focus:outline-none focus:ring-2 focus:ring-[#5A4AF4]/50 transition-all shadow-inner" placeholder={t.search_hint} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
               </div>
               <div className="grid grid-cols-6 gap-8">
                 {searchResults.map((res: any) => <MovieCard key={res.id} item={res} onShowDetails={setSelectedShow} {...getMovieProps(res)} />)}
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-6 gap-8">
               {libraryTab === 'SUGGESTIONS' && aiSuggestions.map((sugg: any) => <MovieCard key={sugg.tmdb_id} item={sugg} onShowDetails={setSelectedShow} {...getMovieProps(sugg)} />)}
               {libraryTab === 'WATCHLIST' && watchList.map((watch: any) => <MovieCard key={watch.tmdb_id} item={watch} onShowDetails={setSelectedShow} {...getMovieProps(watch)} />)}
               {libraryTab === 'RATED' && ratedSeries.map((rated: any) => <MovieCard key={rated.tmdb_id} item={rated} onShowDetails={setSelectedShow} {...getMovieProps(rated)} />)}
             </div>
           )}
        </main>
      </div>

      {selectedShow && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4" onClick={() => setSelectedShow(null)}>
           <div className="relative max-w-7xl w-full bg-[#0a0c10] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
              
              {/* Immersive Backdrop */}
              <div className="absolute inset-0 z-0">
                <img src={`https://image.tmdb.org/t/p/original${selectedShowDetails?.backdrop_path || selectedShow.poster_path}`} className="w-full h-full object-cover opacity-20 blur-sm scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/80 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col p-16 gap-12">
                <div className="flex justify-between items-start">
                   <div className="space-y-4">
                      <h2 className="text-6xl font-black uppercase italic text-white leading-none tracking-tighter drop-shadow-2xl">{selectedShow.name || selectedShow.title}</h2>
                      <div className="flex items-center gap-6 text-[13px] font-black uppercase text-zinc-400 mt-2">
                         <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Calendar size={18} className="text-[#5A4AF4]"/> {selectedShow.first_air_date?.split('-')[0] || 'N/A'}</span>
                         <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Star size={18} fill="currentColor" className="text-yellow-500"/> {selectedShow.vote_average || selectedShow.imdb_rating} / 10</span>
                         {selectedShow.match_score && (
                            <span className="bg-[#5A4AF4] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#5A4AF4]/20">{selectedShow.match_score}% MATCH</span>
                         )}
                      </div>
                   </div>
                   <button onClick={() => setSelectedShow(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-zinc-400 hover:text-white border border-white/10"><X size={32}/></button>
                </div>

                <div className="grid grid-cols-12 gap-16">
                   {/* Col 1: High-Res Poster */}
                   <div className="col-span-3 aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl rotate-1">
                      <img src={`https://image.tmdb.org/t/p/original${selectedShow.poster_path}`} className="w-full h-full object-cover" alt="" />
                   </div>
                   
                   {/* Col 2: Synthesis & Intent */}
                   <div className="col-span-6 space-y-12">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-[12px] font-black text-[#5A4AF4] tracking-[0.4em] uppercase drop-shadow-md"><Info size={20} /> {t.reasoning_label}</div>
                         <DescriptionBox text={selectedShowDetails?.overview || selectedShow.reasoning || selectedShow.overview || 'No information synthesized.'} t={t} />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <button onClick={() => handleGenerate(selectedShow.name || selectedShow.title, selectedShow.poster_path)} className="col-span-2 h-20 bg-[#5A4AF4] hover:bg-[#4d3ee0] text-white rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-[#5A4AF4]/20 transition-all hover:-translate-y-1 active:scale-95 border border-white/10">
                            <Wand2 size={24} /> {t.pivot_search}
                         </button>
                         <button onClick={() => handleToggleWatchlist(selectedShow)} className={`h-16 rounded-2xl font-black uppercase text-[12px] flex items-center justify-center gap-3 border transition-all ${watchList.some((w:any)=>String(w.tmdb_id)===String(selectedShow.tmdb_id || selectedShow.id)) ? 'bg-[#5A4AF4] border-[#5A4AF4] text-white shadow-lg shadow-[#5A4AF4]/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                            <Bookmark size={20}/> {t.btn_watchlist.split(' ')[0]}
                         </button>
                         <button onClick={() => window.open('https://www.themoviedb.org/tv/' + (selectedShow.tmdb_id || selectedShow.id), '_blank')} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-black uppercase text-[12px] flex items-center justify-center gap-3 transition-all hover:bg-white/10">
                            <TmdbIcon className="w-12 h-auto opacity-70" /> TMDb
                         </button>
                         <button onClick={() => handleBlock(selectedShow)} className="col-span-2 h-16 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-black uppercase text-[12px] flex items-center justify-center gap-3 transition-all">
                            <Ban size={20}/> {t.btn_dismiss}
                         </button>
                      </div>
                   </div>

                   {/* Col 3: Radar Scorecard */}
                   <div className="col-span-3 flex flex-col items-center justify-center bg-white/[0.02] rounded-[2.5rem] p-10 border border-white/5">
                      <h4 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.5em] mb-10 drop-shadow-md">NARRATIVE DNA</h4>
                      <RadarChart scores={selectedShow.scores || {depth:5,visuals:5,acting:5,pacing:5,originality:5}} t={t} size={240} />
                      
                      <PrecisionRating 
                        rating={ratedSeries.find((r: any) => String(r.tmdb_id) === String((selectedShow.tmdb_id || selectedShow.id)))?.rating || 0} 
                        onRate={(val) => handleRate(selectedShow, val)}
                        t={t}
                      />
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-md flex items-center justify-center" onClick={() => setIsFilterOpen(false)}>
          <div className="bg-[#121317] border border-white/10 rounded-[3rem] p-12 max-w-2xl w-full space-y-10 animate-in zoom-in-95 duration-300 shadow-3xl" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Filter Discovery</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
             </div>
             <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto custom-scroll pr-4">
                <button 
                  onClick={() => { setSelectedGenreId(null); setCatalogPage(1); setIsFilterOpen(false); }} 
                  className={`px-6 py-5 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center justify-between ${!states.selectedGenreId ? 'bg-[#5A4AF4] text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'}`}
                >
                  {t.genre_all}
                  {!states.selectedGenreId && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </button>
                {states.genres?.map((g: any) => (
                   <button 
                     key={g.id} 
                     onClick={() => { setSelectedGenreId(g.id); setCatalogPage(1); setIsFilterOpen(false); }} 
                     className={`px-6 py-5 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center justify-between truncate ${states.selectedGenreId === g.id ? 'bg-[#5A4AF4] text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'}`}
                   >
                     {g.name}
                     {states.selectedGenreId === g.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                   </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopLayout;
