
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { LibraryItem, Recommendation } from './types';
import { RecommenderService } from './services/gemini';
import { getPopularTV, getTVDetails, getGenres, getDiscoverTV, TMDBShow, TMDBGenre } from './services/tmdb';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';

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

const ModeSelectionScreen = ({ onSelect }: { onSelect: (mode: 'desktop' | 'mobile') => void }) => {
    return (
        <div className="fixed inset-0 z-[5000] bg-[#0f1115] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
             <div className="space-y-6 text-center max-w-sm">
                <div className="flex flex-col items-center gap-2">
                   <h1 className="text-5xl font-black text-white italic tracking-tighter">CINE_GEN<span className="text-indigo-500">.</span></h1>
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
  const [showModeSelection, setShowModeSelection] = useState<boolean>(true);

  // --- MERKEZİ STATE (Single Source of Truth) ---
  const [lang, setLang] = useState<'EN' | 'TR'>('TR');
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [libraryTab, setLibraryTab] = useState<'SUGGESTIONS' | 'WATCHLIST' | 'RATED'>('SUGGESTIONS');
  
  const [ratedSeries, setRatedSeries] = useState<LibraryItem[]>([]);
  const [watchList, setWatchList] = useState<LibraryItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<LibraryItem[]>([]);
  const [blockedSeries, setBlockedSeries] = useState<any[]>([]);
  
  const [seedShow, setSeedShow] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [catalogShows, setCatalogShows] = useState<TMDBShow[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingBackdrop, setAnalyzingBackdrop] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [selectedShowDetails, setSelectedShowDetails] = useState<any>(null);

  // Filtreleme State'leri
  const [minImdb, setMinImdb] = useState(6.6);
  const [isUnderratedOnly, setIsUnderratedOnly] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const t = (TRANSLATIONS as any)[lang] || (TRANSLATIONS as any)['EN'];
  const tmdbLangCode = lang === 'TR' ? 'tr-TR' : 'en-US';

  useEffect(() => {
    const savedMode = localStorage.getItem('appViewMode');
    if (savedMode) {
      setIsDesktopMode(savedMode === 'desktop');
      setShowModeSelection(false);
    }

    const savedRated = localStorage.getItem('ratedSeries');
    const savedWatch = localStorage.getItem('watchList');
    const savedBlocked = localStorage.getItem('blockedSeries');
    if (savedRated) setRatedSeries(JSON.parse(savedRated));
    if (savedWatch) setWatchList(JSON.parse(savedWatch));
    if (savedBlocked) setBlockedSeries(JSON.parse(savedBlocked));

    getGenres(tmdbLangCode).then(setGenres);
  }, [tmdbLangCode]);

  useEffect(() => {
    localStorage.setItem('ratedSeries', JSON.stringify(ratedSeries));
    localStorage.setItem('watchList', JSON.stringify(watchList));
    localStorage.setItem('blockedSeries', JSON.stringify(blockedSeries));
  }, [ratedSeries, watchList, blockedSeries]);

  useEffect(() => {
    if (selectedShow) getTVDetails(selectedShow.tmdb_id || selectedShow.id).then(setSelectedShowDetails);
    else setSelectedShowDetails(null);
  }, [selectedShow]);

  // Catalog fetching logic based on genres/filters
  useEffect(() => {
    if (activeTab === 'CATALOG') {
      getDiscoverTV(selectedGenreId || undefined, catalogPage, sortBy, tmdbLangCode)
        .then(shows => {
          if (catalogPage === 1) setCatalogShows(shows);
          else setCatalogShows(prev => [...prev, ...shows]);
        });
    } else if (catalogShows.length === 0) {
      getPopularTV().then(setCatalogShows);
    }
  }, [selectedGenreId, catalogPage, activeTab, tmdbLangCode, sortBy]);

  const handleModeSelect = (mode: 'desktop' | 'mobile') => {
    setIsDesktopMode(mode === 'desktop');
    localStorage.setItem('appViewMode', mode);
    setShowModeSelection(false);
  };

  const handleSwitchMode = () => {
    const newMode = !isDesktopMode;
    setIsDesktopMode(newMode);
    localStorage.setItem('appViewMode', newMode ? 'desktop' : 'mobile');
  };

  const handleRate = (show: any, rating: number) => {
    const id = show.tmdb_id || show.id;
    const newItem = { 
      id: id.toString(), 
      tmdb_id: id, 
      title: show.name || show.title, 
      rating, 
      poster_path: show.poster_path, 
      added_at: Date.now(),
      vote_average: show.vote_average || show.imdb_rating
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

  const handleBlock = (show: any) => {
    const id = show.tmdb_id || show.id;
    if (blockedSeries.some(b => String(b.tmdb_id) === String(id))) return;
    setBlockedSeries(prev => [...prev, { tmdb_id: id, title: show.name || show.title }]);
    setAiSuggestions(prev => prev.filter(s => String(s.tmdb_id) !== String(id)));
    setWatchList(prev => prev.filter(w => String(w.tmdb_id) !== String(id)));
    setRatedSeries(prev => prev.filter(r => String(r.tmdb_id) !== String(id)));
    setRecommendations(prev => prev.filter(r => String(r.tmdb_id) !== String(id)));
    setSearchResults(prev => prev.filter(s => String(s.id) !== String(id)));
    setSelectedShow(null);
  };

  const handleToggleWatchlist = (show: any) => {
    const id = show.tmdb_id || show.id;
    const isListed = watchList.some(w => String(w.tmdb_id) === String(id));
    if (isListed) {
        setWatchList(prev => prev.filter(w => String(w.tmdb_id) !== String(id)));
    } else {
        const newItem = {
            id: id.toString(),
            tmdb_id: id,
            title: show.name || show.title,
            rating: 0,
            poster_path: show.poster_path,
            added_at: Date.now(),
            vote_average: show.vote_average || show.imdb_rating
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
      const recs = await RecommenderService.recommend(ratedSeries, target, lang, minImdb, isUnderratedOnly);
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
    if (q.length < 3) {
      setSearchResults([]);
      return;
    };
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=1df8a1199d8bb144159aba81cef93f21&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
      const data = await res.json();
      setSearchResults((data.results || []).filter((r: any) => !blockedSeries.some(b => String(b.tmdb_id) === String(r.id))));
    } catch (e) { console.debug("Search error", e); }
  };

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
    blockedSeries, seedShow, recommendations, catalogShows, isLoading, 
    analyzingBackdrop, searchQuery, searchResults, selectedShow, selectedShowDetails,
    genres, selectedGenreId, minImdb, isUnderratedOnly, isFilterOpen, sortBy
  };
  
  const sharedHandlers = { 
    setLang, setActiveTab, setLibraryTab, setSeedShow, 
    handleGenerate, handleRate, handleSearch, setSelectedShow, setCatalogPage,
    handleBlock, handleToggleWatchlist, setSelectedGenreId, setMinImdb, setIsUnderratedOnly, setIsFilterOpen, setSortBy
  };

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
