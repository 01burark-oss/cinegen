# Comprehensive Codebase Audit Report

## Executive Summary

This audit identified **18 critical issues** across security, logic, performance, and code quality categories. The most severe issues are hardcoded API keys and missing error handling that could lead to runtime failures.

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. **Hardcoded API Key in Source Code**
**File:** `services/tmdb.ts`  
**Line:** 3  
**Severity:** CRITICAL

**Issue:**
```typescript
const TMDB_API_KEY = "1df8a1199d8bb144159aba81cef93f21";
```
The TMDB API key is hardcoded directly in the source code. This key is exposed to anyone who views the codebase and will be included in client-side bundles, making it publicly accessible.

**Fix:**
```typescript
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY is not configured');
}
```
**Additional Steps:**
- Move API key to `.env.local` file
- Add `.env.local` to `.gitignore`
- Update README with instructions
- Regenerate the exposed API key from TMDB dashboard

---

### 2. **Missing API Key Validation**
**File:** `services/gemini.ts`  
**Lines:** 11, 40  
**Severity:** HIGH

**Issue:**
```typescript
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });
```
No validation is performed to ensure the API key exists before use. If the key is missing, errors will only surface at runtime.

**Fix:**
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  throw new Error('VITE_API_KEY environment variable is not set. Please configure it in .env.local');
}
const ai = new GoogleGenAI({ apiKey });
```

---

### 3. **API Key Exposure in Client-Side Code**
**File:** `App.tsx`  
**Line:** 345  
**Severity:** HIGH

**Issue:**
The TMDB API key is being used directly in client-side fetch calls, exposing it in network requests that users can inspect.

**Current Code:**
```typescript
const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=1df8a1199d8bb144159aba81cef93f21&query=...`);
```

**Fix:**
Move TMDB API calls to a backend proxy or use environment variables:
```typescript
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY not configured');
  return;
}
const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
```

---

## ⚠️ LOGIC ERRORS & BUGS

### 4. **Missing Error Handling for localStorage JSON.parse**
**File:** `App.tsx`  
**Lines:** 220-222  
**Severity:** MEDIUM

**Issue:**
```typescript
if (savedRated) setRatedSeries(JSON.parse(savedRated));
if (savedWatch) setWatchList(JSON.parse(savedWatch));
if (savedBlocked) setBlockedSeries(JSON.parse(savedBlocked));
```
If localStorage contains corrupted JSON data, `JSON.parse` will throw an error and crash the app.

**Fix:**
```typescript
try {
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
} catch (e) {
  console.error('Error parsing localStorage data:', e);
  // Clear corrupted data
  localStorage.removeItem('ratedSeries');
  localStorage.removeItem('watchList');
  localStorage.removeItem('blockedSeries');
}
```

---

### 5. **Missing useEffect Dependencies**
**File:** `App.tsx`  
**Lines:** 239-249  
**Severity:** MEDIUM

**Issue:**
```typescript
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
```
The dependency array is missing `catalogShows.length`, which could cause stale closures. However, including it would cause infinite loops. The logic should be refactored.

**Fix:**
```typescript
useEffect(() => {
  if (activeTab === 'CATALOG') {
    getDiscoverTV(selectedGenreId || undefined, catalogPage, sortBy, tmdbLangCode)
      .then(shows => {
        if (catalogPage === 1) setCatalogShows(shows);
        else setCatalogShows(prev => [...prev, ...shows]);
      })
      .catch(err => {
        console.error('Error fetching catalog:', err);
        setCatalogShows([]);
      });
  }
}, [selectedGenreId, catalogPage, activeTab, tmdbLangCode, sortBy]);

// Separate effect for initial load
useEffect(() => {
  if (activeTab !== 'CATALOG' && catalogShows.length === 0) {
    getPopularTV()
      .then(setCatalogShows)
      .catch(err => {
        console.error('Error fetching popular TV:', err);
        setCatalogShows([]);
      });
  }
}, [activeTab]); // Only re-run when tab changes
```

---

### 6. **Missing Error Handling in API Calls**
**File:** `App.tsx`  
**Line:** 345-348  
**Severity:** MEDIUM

**Issue:**
```typescript
try {
  const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=...&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
  const data = await res.json();
  setSearchResults((data.results || []).filter((r: any) => !blockedSeries.some(b => String(b.tmdb_id) === String(r.id))));
} catch (e) { console.debug("Search error", e); }
```
- No check for `response.ok` before parsing JSON
- Silent error handling (only debug log)
- No user feedback on failure

**Fix:**
```typescript
try {
  const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  setSearchResults((data.results || []).filter((r: any) => !blockedSeries.some(b => String(b.tmdb_id) === String(r.id))));
} catch (e) {
  console.error("Search error", e);
  setSearchResults([]);
  // Optionally show user-facing error message
}
```

---

### 7. **Missing Error Handling in getTVDetails**
**File:** `App.tsx`  
**Line:** 234  
**Severity:** MEDIUM

**Issue:**
```typescript
useEffect(() => {
  if (selectedShow) getTVDetails(selectedShow.tmdb_id || selectedShow.id).then(setSelectedShowDetails);
  else setSelectedShowDetails(null);
}, [selectedShow]);
```
No error handling if `getTVDetails` fails, which could leave the UI in an inconsistent state.

**Fix:**
```typescript
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
```

---

### 8. **Missing Error Handling in getGenres**
**File:** `App.tsx`  
**Line:** 224  
**Severity:** LOW

**Issue:**
```typescript
getGenres(tmdbLangCode).then(setGenres);
```
No error handling if `getGenres` fails. If the API call fails, genres will remain empty without user feedback.

**Fix:**
```typescript
getGenres(tmdbLangCode)
  .then(setGenres)
  .catch(err => {
    console.error('Error fetching genres:', err);
    // Optionally set empty array or show error state
    setGenres([]);
  });
```

---

### 9. **Missing State Initialization for aiSuggestions**
**File:** `App.tsx`  
**Line:** 185  
**Severity:** LOW

**Issue:**
`aiSuggestions` state is not initialized from localStorage, unlike `ratedSeries`, `watchList`, and `blockedSeries`. This means AI suggestions are lost on page refresh.

**Fix:**
```typescript
const savedSuggestions = localStorage.getItem('aiSuggestions');
if (savedSuggestions) {
  try {
    const parsed = JSON.parse(savedSuggestions);
    if (Array.isArray(parsed)) setAiSuggestions(parsed);
  } catch (e) {
    console.error('Error parsing aiSuggestions:', e);
  }
}
```

And update the save effect:
```typescript
useEffect(() => {
  localStorage.setItem('ratedSeries', JSON.stringify(ratedSeries));
  localStorage.setItem('watchList', JSON.stringify(watchList));
  localStorage.setItem('blockedSeries', JSON.stringify(blockedSeries));
  localStorage.setItem('aiSuggestions', JSON.stringify(aiSuggestions));
}, [ratedSeries, watchList, blockedSeries, aiSuggestions]);
```

---

### 10. **Missing Null/Undefined Checks for Image Paths**
**File:** `components/DesktopLayout.tsx`  
**Line:** 133, 361, 383  
**File:** `components/MobileLayout.tsx`  
**Line:** 123, 316  
**Severity:** MEDIUM

**Issue:**
```typescript
<img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} className="..." alt="" />
```
If `poster_path` is `null` or `undefined`, this creates an invalid URL (`/w500null`).

**Fix:**
```typescript
{item.poster_path ? (
  <img 
    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
    className="..." 
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
```

---

### 11. **Potential Null Reference in Block Handler**
**File:** `App.tsx`  
**Line:** 285-295  
**Severity:** LOW

**Issue:**
```typescript
const handleBlock = (show: any) => {
  const id = show.tmdb_id || show.id;
  if (blockedSeries.some(b => String(b.tmdb_id) === String(id))) return;
  // ...
};
```
If `show` is `null` or both `tmdb_id` and `id` are undefined, `id` will be `undefined`, causing issues downstream.

**Fix:**
```typescript
const handleBlock = (show: any) => {
  if (!show) return;
  const id = show.tmdb_id || show.id;
  if (!id) {
    console.error('Cannot block show: missing ID');
    return;
  }
  if (blockedSeries.some(b => String(b.tmdb_id) === String(id))) return;
  // ... rest of function
};
```

---

## 🚀 PERFORMANCE ISSUES

### 12. **No Debouncing on Search Input**
**File:** `App.tsx`  
**Lines:** 338-349  
**Severity:** MEDIUM

**Issue:**
The search function is called on every keystroke, potentially making hundreds of API calls as the user types.

**Fix:**
```typescript
import { useEffect, useRef } from 'react';

// In AppContent component
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleSearch = async (q: string) => {
  setSearchQuery(q);
  if (q.length < 3) {
    setSearchResults([]);
    return;
  }
  
  // Clear existing timeout
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  
  // Debounce API call
  searchTimeoutRef.current = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${tmdbLangCode}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setSearchResults((data.results || []).filter((r: any) => !blockedSeries.some(b => String(b.tmdb_id) === String(r.id))));
    } catch (e) {
      console.error("Search error", e);
      setSearchResults([]);
    }
  }, 300); // 300ms debounce
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, []);
```

---

### 13. **Sequential API Calls in Recommendation Verification**
**File:** `services/gemini.ts`  
**Lines:** 150-162  
**Severity:** MEDIUM

**Issue:**
```typescript
for (const rec of rawRecs) {
  if (blockedList.some((b: any) => b.title.toLowerCase() === rec.title.toLowerCase())) continue;
  const tmdbMatch = await tmdbSearchTV(rec.title);
  if (tmdbMatch) {
    verifiedRecs.push({...});
  }
}
```
API calls are made sequentially in a loop, which is slow. For 5 recommendations, this adds significant latency.

**Fix:**
```typescript
const verificationPromises = rawRecs.map(async (rec) => {
  if (blockedList.some((b: any) => b.title.toLowerCase() === rec.title.toLowerCase())) {
    return null;
  }
  const tmdbMatch = await tmdbSearchTV(rec.title);
  if (tmdbMatch) {
    return {
      ...rec,
      id: tmdbMatch.id.toString(),
      tmdb_id: tmdbMatch.id,
      poster_path: tmdbMatch.poster_path,
      trailer_url: ""
    };
  }
  return null;
});

const results = await Promise.all(verificationPromises);
const verifiedRecs = results.filter((rec): rec is Recommendation => rec !== null);
```

---

### 14. **Missing Loading State for Catalog Pagination**
**File:** `App.tsx`  
**Line:** 292 (MobileLayout)  
**Severity:** LOW

**Issue:**
When "LOAD MORE" is clicked, there's no loading indicator, so users don't know if the action is processing.

**Fix:**
Add a loading state:
```typescript
const [isLoadingMore, setIsLoadingMore] = useState(false);

// In the load more handler
const handleLoadMore = async () => {
  setIsLoadingMore(true);
  setCatalogPage(prev => prev + 1);
  // Loading will be handled by the useEffect
};

// In the useEffect, set loading to false when done
useEffect(() => {
  if (activeTab === 'CATALOG') {
    setIsLoadingMore(true);
    getDiscoverTV(selectedGenreId || undefined, catalogPage, sortBy, tmdbLangCode)
      .then(shows => {
        if (catalogPage === 1) setCatalogShows(shows);
        else setCatalogShows(prev => [...prev, ...shows]);
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setIsLoadingMore(false));
  }
}, [selectedGenreId, catalogPage, activeTab, tmdbLangCode, sortBy]);

// Update button
<button 
  onClick={handleLoadMore} 
  disabled={isLoadingMore}
  className="..."
>
  {isLoadingMore ? 'Loading...' : t.load_more}
</button>
```

---

## 🧹 CODE QUALITY ISSUES

### 15. **Excessive Use of `any` Type**
**Files:** Multiple  
**Severity:** LOW (but impacts maintainability)

**Issue:**
The codebase uses `any` type extensively, which defeats TypeScript's type safety benefits.

**Examples:**
- `App.tsx:186`: `const [blockedSeries, setBlockedSeries] = useState<any[]>([]);`
- `App.tsx:198`: `const [selectedShow, setSelectedShow] = useState<any>(null);`
- Multiple function parameters use `any`

**Fix:**
Create proper types:
```typescript
// In types.ts
export interface BlockedSeries {
  tmdb_id: number;
  title: string;
}

export interface SelectedShow {
  id?: number;
  tmdb_id?: number;
  name?: string;
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  // ... other properties
}

// In App.tsx
const [blockedSeries, setBlockedSeries] = useState<BlockedSeries[]>([]);
const [selectedShow, setSelectedShow] = useState<SelectedShow | null>(null);
```

---

### 16. **Magic Numbers and Hardcoded Values**
**Files:** Multiple  
**Severity:** LOW

**Issue:**
Magic numbers scattered throughout the code without explanation or constants.

**Examples:**
- `App.tsx:202`: `const [minImdb, setMinImdb] = useState(6.6);`
- `App.tsx:340`: `if (q.length < 3)` - why 3?
- `components/DesktopLayout.tsx:273`: `min="6.0" max="9.5" step="0.1"`

**Fix:**
```typescript
// In a constants file or at the top of App.tsx
const MIN_SEARCH_QUERY_LENGTH = 3;
const DEFAULT_MIN_IMDB_RATING = 6.6;
const MIN_IMDB_RATING = 6.0;
const MAX_IMDB_RATING = 9.5;
const IMDB_RATING_STEP = 0.1;
const HIGH_RATING_THRESHOLD = 7;
```

---

### 17. **Inconsistent Error Handling**
**Files:** Multiple  
**Severity:** LOW

**Issue:**
Some functions use `console.error`, others use `console.debug`, and some have no error handling at all.

**Fix:**
Create a consistent error handling utility:
```typescript
// utils/errorHandler.ts
export const handleError = (error: unknown, context: string) => {
  console.error(`[${context}]`, error);
  // Could also send to error tracking service
};

// Usage
try {
  // ...
} catch (e) {
  handleError(e, 'Search');
}
```

---

### 18. **Missing Input Validation**
**File:** `services/gemini.ts`  
**Line:** 33-39  
**Severity:** LOW

**Issue:**
No validation for function parameters (e.g., negative `minImdb`, invalid `language` values).

**Fix:**
```typescript
static async recommend(
  library: LibraryItem[],
  seedTitle?: string,
  language: 'EN' | 'TR' = 'TR',
  minImdb: number = 6.6,
  isUnderratedOnly: boolean = true
): Promise<Recommendation[]> {
  // Validate inputs
  if (!Array.isArray(library)) {
    throw new Error('Library must be an array');
  }
  if (minImdb < 0 || minImdb > 10) {
    throw new Error('minImdb must be between 0 and 10');
  }
  if (language !== 'EN' && language !== 'TR') {
    throw new Error('language must be EN or TR');
  }
  
  // ... rest of function
}
```

---

## 📊 Summary Statistics

- **Critical Issues:** 3
- **High Severity:** 2
- **Medium Severity:** 9
- **Low Severity:** 4
- **Total Issues:** 18

---

## 🎯 Recommended Priority Order

1. **Immediate (Security):**
   - Fix hardcoded API keys (#1, #2, #3)

2. **High Priority (Stability):**
   - Add error handling for localStorage (#4)
   - Fix useEffect dependencies (#5)
   - Add error handling in API calls (#6, #7)

3. **Medium Priority (User Experience):**
   - Add debouncing to search (#12)
   - Fix image loading issues (#10)
   - Add loading states (#14)

4. **Low Priority (Code Quality):**
   - Replace `any` types (#15)
   - Extract magic numbers (#16)
   - Standardize error handling (#17, #18)
   - Add error handling for getGenres (#8)

---

## 🔧 Implementation Notes

- Most fixes are straightforward and can be implemented incrementally
- Security fixes (#1-3) should be done immediately before any deployment
- Consider creating a `.env.example` file to document required environment variables
- Add error boundaries around major features for better error recovery
- Consider adding unit tests for error handling paths

