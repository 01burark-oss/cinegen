
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { LibraryItem, Recommendation, BlockedSeries, SelectedShow } from './types';
import { RecommenderService } from './services/gemini';
import { getPopularTV, getTVDetails, getGenres, getDiscoverTV, TMDBShow, TMDBGenre } from './services/tmdb';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';

// Constants for magic numbers
const MIN_SEARCH_QUERY_LENGTH = 3;
const DEFAULT_MIN_IMDB_RATING = 6.6;
const MIN_IMDB_RATING = 6.0;
const MAX_IMDB_RATING = 9.5;
const IMDB_RATING_STEP = 0.1;
const SEARCH_DEBOUNCE_MS = 300;

const TRANSLATIONS = {
  EN: {
    title: 'CINE_GEN.',
    discovery_hub: 'DISCOVERY HUB',
    active_seed: 'Inspiration Source',
    placeholder_seed: 'REFERENCE SERIES',
    min_imdb_label: 'Min IMDb Rating',
    underrated_label: 'Underrated Only',
    run_analysis: 'START ANALYSIS',
    nav_discovery: 'DISCOVERY',
    nav_dashboard: 'MY LIBRARY',
    nav_catalog: 'CATALOG',
    nav_search: 'SEARCH',
    catalog_title: 'ALL SERIES',
    genre_all: 'ALL',
    no_results: 'No results found matching your filter.',
    load_more: 'LOAD MORE',
    perfect: 'Perfect!',
    excellent: 'Excellent',
    great: 'Great',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    dna_match: 'DNA MATCH',
    viewer_reviews: 'USER REVIEWS',
    translate_btn: 'Translate to Turkish',
    revert_btn: 'Revert to Original',
    translating_label: 'Translating...',
    read_more: 'Read More',
    read_less: 'Read Less',
    translate_review: '🇹🇷 Translate to Turkish',
    see_more: 'SEE MORE',
    filter_btn: 'Filter',
    sort_btn: 'Sort',
    sort_pop: 'Popularity',
    sort_rating: 'Highest Rated',
    sort_newest: 'Newest Releases',
    tab_suggestions: 'AI Suggestions',
    tab_watchlist: 'Watchlist',
    tab_rated: 'Watched',
    section_suggestions: 'AI SUGGESTIONS',
    section_watchlist: 'WATCHLIST',
    btn_watchlist: 'Watch Later',
    btn_dismiss: 'Dismiss',
    btn_block: 'Block / Don\'t recommend',
    empty_suggestions: 'No new suggestions yet. Run an analysis in the Discovery tab!',
    empty_watchlist: 'Your list is empty. Start exploring.',
    empty_watched: 'You haven\'t rated any series yet.',
    radar_depth: 'Depth',
    radar_visuals: 'Visuals',
    radar_acting: 'Acting',
    radar_pacing: 'Pacing',
    radar_originality: 'Originality',
    rating_label: 'Your Rating',
    add_lib: 'Add to Library',
    search_hint: 'Deep Search Database...',
    deep_dive: 'DEEP DIVE',
    watch_trailer: 'TRAILER',
    pivot_search: 'ANALYZE SIMILARS',
    reasoning_label: 'DNA ANALYSIS',
    btn_start_discovery: 'START DISCOVERY',
    reset_confirm: 'Are you sure you want to reset all data? This cannot be undone.'
  },
  TR: {
    title: 'CINE_GEN.',
    discovery_hub: 'KEŞİF MERKEZİ',
    active_seed: 'İlham Kaynağı',
    placeholder_seed: 'REFERANS DİZİ',
    min_imdb_label: 'Min IMDb Puanı',
    underrated_label: 'Sadece Az Bilinenler',
    run_analysis: 'KEŞFE BAŞLA',
    nav_discovery: 'KEŞİF',
    nav_dashboard: 'KÜTÜPHANEM',
    nav_catalog: 'DİZİLER',
    nav_search: 'ARAMA',
    catalog_title: 'TÜM DİZİLER',
    genre_all: 'TÜMÜ',
    no_results: 'Seçili kategoriye göre sonuç bulunamadı.',
    load_more: 'DAHA FAZLA YÜKLE',
    perfect: 'Mükemmel!',
    excellent: 'Harika',
    great: 'Çok İyi',
    good: 'İyi',
    average: 'Ortalama',
    poor: 'Zayıf',
    dna_match: 'DNA EŞLEŞMESİ',
    viewer_reviews: 'KULLANICI YORUMLARI',
    translate_btn: 'Türkçeye Çevir',
    revert_btn: 'Orijinal Dile Dön',
    translating_label: 'Çeviriliyor...',
    read_more: 'Devamını Oku',
    read_less: 'Daha Az',
    translate_review: '🇹🇷 Türkçeye Çevir',
    see_more: 'DAHA FAZLA',
    filter_btn: 'Filtrele',
    sort_btn: 'Sırala',
    sort_pop: 'En Popüler',
    sort_rating: 'En Yüksek Puan',
    sort_newest: 'En Yeniler',
    tab_suggestions: 'Yapay Zeka Önerileri',
    tab_watchlist: 'İzleyeceklerim',
    tab_rated: 'İzlediklerim',
    section_suggestions: 'YAPAY ZEKA ÖNERİLERİ',
    section_watchlist: 'İZLEME LİSTEM',
    btn_watchlist: 'Daha Sonra İzleyeceğim',
    btn_dismiss: 'Kaldır',
    btn_block: 'Engelle / Bir daha önerme',
    empty_suggestions: 'Henüz yeni bir öneri yok. Keşif sekmesinden analiz başlatın!',
    empty_watchlist: 'Listen boş. Keşfetmeye başla.',
    empty_watched: 'Henüz puanladığın bir dizi yok.',
    radar_depth: 'Derinlik',
    radar_visuals: 'Görsellik',
    radar_acting: 'Oyunculuk',
    radar_pacing: 'Tempo',
    radar_originality: 'Özgünlük',
    rating_label: 'Puanın',
    add_lib: 'Koleksiyona Ekle',
    search_hint: 'Veritabanında ara...',
    deep_dive: 'DERİN İNCELEME',
    watch_trailer: 'FRAGMAN',
    pivot_search: 'BENZERİNİ ANALİZ ET',
    reasoning_label: 'DNA ANALİZİ',
    btn_start_discovery: 'KEŞFE BAŞLA',
    reset_confirm: 'Tüm verileri sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.'
  }
};

// Custom SVG Logo Component - Exported for use in layouts
export const CineGenLogo = ({ className = "" }: { className?: string }) => (
    <svg width="256" height="256" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="stremioGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#7E57C2" /> <stop offset="100%" stopColor="#26C6DA" /> </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0" result="glowAlpha"/>
                <feOffset dx="2" dy="4" result="offsetBlur"/>
                <feMerge>
                    <feMergeNode in="offsetBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <g transform="translate(66, 86) scale(0.9)" filter="url(#softGlow)">
            <rect x="0" y="50" width="40" height="40" rx="4" fill="url(#stremioGrad)" opacity="0.6" />
            <rect x="0" y="100" width="40" height="40" rx="4" fill="url(#stremioGrad)" opacity="0.8" />
            <rect x="0" y="150" width="40" height="40" rx="4" fill="url(#stremioGrad)" opacity="0.5" />
            <rect x="0" y="200" width="40" height="40" rx="4" fill="url(#stremioGrad)" opacity="0.9" />
            <rect x="0" y="250" width="40" height="40" rx="4" fill="url(#stremioGrad)" opacity="0.7" />

            <rect x="50" y="80" width="30" height="30" rx="3" fill="url(#stremioGrad)" opacity="0.85" />
            <rect x="50" y="220" width="30" height="30" rx="3" fill="url(#stremioGrad)" opacity="0.85" />

            <path d="M90,70 L140,45 L140,295 L90,270 Z" fill="url(#stremioGrad)" opacity="0.95" />
            <path d="M150,40 L210,10 L210,330 L150,300 Z" fill="url(#stremioGrad)" />

            <path d="M220,5 L380,170 L220,335 Z" fill="url(#stremioGrad)" />
            <path d="M220,5 L380,170 L220,170 Z" fill="#FFFFFF" opacity="0.1" />
        </g>
    </svg>
);

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 3000); // 3 seconds
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[6000] bg-gradient-to-br from-[#0a0c10] via-[#0f1115] to-[#0a0c10] flex flex-col items-center justify-center animate-in fade-in duration-1000">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-16 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center space-y-8">
                {/* Logo */}
                <div className="animate-in zoom-in-50 duration-1000 delay-300">
                    <CineGenLogo className="drop-shadow-2xl" />
                </div>

                {/* Title */}
                <div className="text-center animate-in slide-in-from-bottom duration-1000 delay-700">
                    <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2">
                        CINE_GEN<span className="text-indigo-400">.</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-[0.3em]">Next-Gen Discovery</p>
                </div>

                {/* Loading Bar */}
                <div className="animate-in fade-in duration-1000 delay-1000">
                    <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-[loading_3s_ease-in-out]"></div>
                    </div>
                </div>

                {/* Made by */}
                <div className="animate-in fade-in duration-1000 delay-1200 mt-12">
                    <p className="text-xs font-light text-zinc-500 tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                        made by Burak Özmen
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

const ModeSelectionScreen = ({ onSelect }: { onSelect: (mode: 'desktop' | 'mobile') => void }) => {
    return (
        <div className="fixed inset-0 z-[5000] bg-[#0f1115] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
             <div className="space-y-6 text-center max-w-sm">
                <div className="flex flex-col items-center gap-2">
                   <CineGenLogo className="w-16 h-16 mb-4" />
                   <h1 className="text-3xl font-black text-white italic tracking-tighter">CINE_GEN<span className="text-indigo-500">.</span></h1>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Next-Gen Discovery</p>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full pt-8">
                  <button
                    onClick={() => onSelect('mobile')}
                    className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Mobile Experience</p>
                      <p className="text-[10px] text-zinc-500 uppercase">Optimized for vertical viewing</p>
                    </div>
                    <Smartphone className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => onSelect('desktop')}
                    className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Desktop Interface</p>
                      <p className="text-[10px] text-zinc-500 uppercase">Full radar & visual DNA hub</p>
                    </div>
                    <Monitor className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  </button>
                </div>
             </div>
        </div>
    )
};

const AppContent: React.FC = () => {
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [showModeSelection, setShowModeSelection] = useState<boolean>(true);

  // --- MERKEZİ STATE (Single Source of Truth) ---
  const [lang, setLang] = useState<'EN' | 'TR'>('TR');
  const [activeTab, setActiveTab] = useState('CATALOG');
  const [libraryTab, setLibraryTab] = useState<'SUGGESTIONS' | 'WATCHLIST' | 'RATED'>('SUGGESTIONS');
  
  const [ratedSeries, setRatedSeries] = useState<LibraryItem[]>([]);
  const [watchList, setWatchList] = useState<LibraryItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<LibraryItem[]>([]);
  const [blockedSeries, setBlockedSeries] = useState<BlockedSeries[]>([]);
  
  const [seedShow, setSeedShow] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [catalogShows, setCatalogShows] = useState<TMDBShow[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [analyzingBackdrop, setAnalyzingBackdrop] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<SelectedShow | null>(null);
  const [selectedShowDetails, setSelectedShowDetails] = useState<TMDBShow | null>(null);

  // Filtreleme State'leri
  const [minImdb, setMinImdb] = useState(DEFAULT_MIN_IMDB_RATING);
  
  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUnderratedOnly, setIsUnderratedOnly] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const t = (TRANSLATIONS as any)[lang] || (TRANSLATIONS as any)['EN'];
  const tmdbLangCode = lang === 'TR' ? 'tr-TR' : 'en-US';

  useEffect(() => {
    const savedMode = localStorage.getItem('appViewMode');
    if (savedMode) {
      setIsDesktopMode(savedMode === 'desktop');
      // Do NOT set setShowModeSelection(false) here, let the user explicitly choose or handle it through handleModeSelect
    }
  }, []);

  useEffect(() => {
    try {
      const savedRated = localStorage.getItem('ratedSeries');
      const savedWatch = localStorage.getItem('watchList');
      const savedBlocked = localStorage.getItem('blockedSeries');
      const savedSuggestions = localStorage.getItem('aiSuggestions');

      if (savedRated) {
        const parsed = JSON.parse(savedRated);
        if (Array.isArray(parsed)) setRatedSeries(parsed);
      }
      if (savedWatch) {
        const parsed = JSON.parse(savedWatch);
        if (Array.isArray(parsed)) setWatchList(parsed);
      }
      if (savedBlocked) {
        const parsed = JSON.parse(savedBlocked);
        if (Array.isArray(parsed)) setBlockedSeries(parsed);
      }
      if (savedSuggestions) {
        const parsed = JSON.parse(savedSuggestions);
        if (Array.isArray(parsed)) setAiSuggestions(parsed);
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      // Clear corrupted data
      localStorage.removeItem('ratedSeries');
      localStorage.removeItem('watchList');
      localStorage.removeItem('blockedSeries');
      localStorage.removeItem('aiSuggestions');
    }

    getGenres(tmdbLangCode)
      .then(setGenres)
      .catch(err => {
        console.error('Error fetching genres:', err);
        setGenres([]);
      });
  }, [tmdbLangCode]);

  useEffect(() => {
    localStorage.setItem('ratedSeries', JSON.stringify(ratedSeries));
    localStorage.setItem('watchList', JSON.stringify(watchList));
    localStorage.setItem('blockedSeries', JSON.stringify(blockedSeries));
    localStorage.setItem('aiSuggestions', JSON.stringify(aiSuggestions));
  }, [ratedSeries, watchList, blockedSeries, aiSuggestions]);

  useEffect(() => {
    if (selectedShow) {
      getTVDetails(selectedShow.tmdb_id || selectedShow.id)
        .then(setSelectedShowDetails)
        .catch(err => {
          console.error('Error fetching show details:', err);
          setSelectedShowDetails(null);
        });
    } else {
      setSelectedShowDetails(null);
    }
  }, [selectedShow]);

  // Catalog fetching logic based on genres/filters
  useEffect(() => {
    if (activeTab === 'CATALOG') {
      // Don't show synthesizing screen for catalog, use separate loading state
      const loadCatalogPage = async (page: number) => {
        setIsCatalogLoading(true);
        try {
          // Load 2 pages for 40 results each time
          const [page1, page2] = await Promise.all([
            getDiscoverTV(selectedGenreId || undefined, page, sortBy, tmdbLangCode),
            getDiscoverTV(selectedGenreId || undefined, page + 1, sortBy, tmdbLangCode)
          ]);

          const newShows = [...page1, ...page2];
          if (page === 1) setCatalogShows(newShows);
          else setCatalogShows(prev => [...prev, ...newShows]);
        } catch (err) {
          console.error('Error fetching catalog:', err);
          if (page === 1) setCatalogShows([]);
        } finally {
          setIsCatalogLoading(false);
        }
      };

      loadCatalogPage(catalogPage);
    }
  }, [selectedGenreId, catalogPage, activeTab, tmdbLangCode, sortBy]);

  // Initial load of popular TV shows if catalog is empty
  useEffect(() => {
    if (catalogShows.length === 0) {
      setIsCatalogLoading(true); // Use catalog loading state for initial load too
      getPopularTV()
        .then(setCatalogShows)
        .catch(err => {
          console.error('Error fetching popular TV:', err);
          setCatalogShows([]);
        })
        .finally(() => setIsCatalogLoading(false));
    }
  }, [catalogShows.length]); // Re-run if catalogShows becomes empty (e.g., after an error or reset)

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Ana uygulama gösterilsin, mode selection tekrar açılmasın
  };

  const handleModeSelect = (mode: 'desktop' | 'mobile') => {
    setIsDesktopMode(mode === 'desktop');
    localStorage.setItem('appViewMode', mode);
    setShowModeSelection(false);
    setShowSplash(true); // Mode seçildikten sonra splash screen göster
  };

  const handleSwitchMode = () => {
    const newMode = !isDesktopMode;
    setIsDesktopMode(newMode);
    localStorage.setItem('appViewMode', newMode ? 'desktop' : 'mobile');
  };

  const handleRate = (show: SelectedShow | TMDBShow, rating: number) => {
    const id = show.tmdb_id || show.id;
    if (!id) {
      console.error('Cannot rate show: missing ID');
      return;
    }
    const newItem: LibraryItem = { 
      id: id.toString(), 
      tmdb_id: id, 
      title: (show as any).name || (show as any).title || 'Unknown', 
      rating, 
      poster_path: show.poster_path, 
      added_at: Date.now(),
      vote_average: (show as any).vote_average || (show as any).imdb_rating
    };
    setRatedSeries(prev => {
      const filtered = prev.filter(r => String(r.tmdb_id) !== String(id));
      return rating === 0 ? filtered : [newItem, ...filtered].sort((a,b) => b.rating - a.rating);
    });
    
    if (rating > 0) {
       setAiSuggestions(prev => prev.filter(s => String(s.tmdb_id) !== String(id)));
       setWatchList(prev => prev.filter(w => String(w.tmdb_id) !== String(id)));
    }
  };

  const handleBlock = (show: SelectedShow | TMDBShow) => {
    if (!show) return;
    const id = show.tmdb_id || show.id;
    if (!id) {
      console.error('Cannot block show: missing ID');
      return;
    }
    if (blockedSeries.some(b => String(b.tmdb_id) === String(id))) return;
    setBlockedSeries(prev => [...prev, { tmdb_id: id, title: (show as any).name || (show as any).title || 'Unknown' }]);
    setAiSuggestions(prev => prev.filter(s => String(s.tmdb_id) !== String(id)));
    setWatchList(prev => prev.filter(w => String(w.tmdb_id) !== String(id)));
    setRatedSeries(prev => prev.filter(r => String(r.tmdb_id) !== String(id)));
    setRecommendations(prev => prev.filter(r => String(r.tmdb_id) !== String(id)));
    setSearchResults(prev => prev.filter(s => String(s.id) !== String(id)));
    setSelectedShow(null);
  };

  const handleToggleWatchlist = (show: SelectedShow | TMDBShow) => {
    const id = show.tmdb_id || show.id;
    if (!id) {
      console.error('Cannot toggle watchlist: missing ID');
      return;
    }
    const isListed = watchList.some(w => String(w.tmdb_id) === String(id));
    if (isListed) {
        setWatchList(prev => prev.filter(w => String(w.tmdb_id) !== String(id)));
    } else {
        const newItem: LibraryItem = {
            id: id.toString(),
            tmdb_id: id,
            title: (show as any).name || (show as any).title || 'Unknown',
            rating: 0,
            poster_path: show.poster_path,
            added_at: Date.now(),
            vote_average: (show as any).vote_average || (show as any).imdb_rating
        };
        setWatchList(prev => [newItem, ...prev]);
        setAiSuggestions(prev => prev.filter(s => String(s.tmdb_id) !== String(id)));
    }
  };

  const handleGenerate = async (pivotTitle?: string, posterPath?: string) => {
    const target = pivotTitle || seedShow;
    if (!target) return;

    if (pivotTitle) setSelectedShow(null);
    if (posterPath) setAnalyzingBackdrop(posterPath);

    setIsLoading(true);
    try {
      const recs = await RecommenderService.recommend(ratedSeries, target, lang, minImdb, isUnderratedOnly, blockedSeries);
      const filtered = recs.filter(rec => !blockedSeries.some(b => String(b.tmdb_id) === String(rec.tmdb_id)));
      setRecommendations(filtered);
      setActiveTab('DISCOVERY');
    } catch (e) {
      console.error("AI Error", e);
    } finally { 
      setIsLoading(false); 
      setAnalyzingBackdrop(null);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < MIN_SEARCH_QUERY_LENGTH) {
      setSearchResults([]);
      return;
    }
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce API call
    searchTimeoutRef.current = setTimeout(async () => {
    const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      console.error('VITE_TMDB_API_KEY is not configured');
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
      if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
        setSearchResults((data.results || []).filter((r: TMDBShow) => !blockedSeries.some(b => String(b.tmdb_id) === String(r.id))));
    } catch (e) {
      console.error("Search error", e);
      setSearchResults([]);
    }
    }, SEARCH_DEBOUNCE_MS);
  };

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleResetData = () => {
    if(confirm(t.reset_confirm || "Are you sure?")) {
        localStorage.clear();
        setRatedSeries([]);
        setWatchList([]);
        setBlockedSeries([]);
        window.location.reload();
    }
  };

  const sharedStates = {
    lang, activeTab, libraryTab, ratedSeries, watchList, aiSuggestions,
    blockedSeries, seedShow, recommendations, catalogShows, isLoading, isCatalogLoading,
    analyzingBackdrop, searchQuery, searchResults, selectedShow, selectedShowDetails,
    genres, selectedGenreId, minImdb, isUnderratedOnly, isFilterOpen, sortBy
  };
  
  const sharedHandlers = { 
    setLang, setActiveTab, setLibraryTab, setSeedShow, 
    handleGenerate, handleRate, handleSearch, setSelectedShow, setCatalogPage,
    handleBlock, handleToggleWatchlist, setSelectedGenreId, setMinImdb, setIsUnderratedOnly, setIsFilterOpen, setSortBy
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showModeSelection) {
    return <ModeSelectionScreen onSelect={handleModeSelect} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0f1115]">
      {isDesktopMode ? (
        <DesktopLayout 
          states={sharedStates} 
          handlers={sharedHandlers} 
          t={t} 
          onSwitchToMobile={handleSwitchMode}
          onReset={handleResetData}
        />
      ) : (
        <MobileLayout 
          states={sharedStates} 
          handlers={sharedHandlers} 
          t={t} 
          onSwitchToDesktop={handleSwitchMode}
          onReset={handleResetData}
        />
      )}
    </div>
  );
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(_: Error) { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-6" />
          <h1 className="text-2xl font-black text-white uppercase italic mb-4">Something went wrong</h1>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 text-white font-black uppercase rounded-xl">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
