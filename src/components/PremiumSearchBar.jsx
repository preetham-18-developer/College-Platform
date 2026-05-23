import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, History, X, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumSearchBar = ({ search, setSearch, results, isLoading }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (!isFocused) return;
    
    // Only navigate suggestions if we have search text
    const maxIndex = search.trim() ? Math.min(results.length, 5) - 1 : recentSearches.length - 1;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        if (search.trim() && results[activeIndex]) {
          setSearch(results[activeIndex].name);
          saveRecentSearch(results[activeIndex].name);
          setIsFocused(false);
        } else if (!search.trim() && recentSearches[activeIndex]) {
          setSearch(recentSearches[activeIndex]);
          setIsFocused(false);
        }
      } else {
        saveRecentSearch(search);
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSelect = (term) => {
    setSearch(term);
    saveRecentSearch(term);
    setIsFocused(false);
  };

  const displayResults = results.slice(0, 5);

  return (
    <div className="position-relative w-100 mx-auto" ref={wrapperRef} style={{ zIndex: 1050, maxWidth: '650px' }}>
      {/* Input Field */}
      <div className={`bg-white p-2 rounded-pill shadow-lg border d-flex align-items-center position-relative transition-all ${isFocused ? 'border-primary shadow-xl' : ''}`}>
        <div className="d-flex align-items-center ps-3 text-muted">
          <Search size={20} className={isFocused ? "text-primary" : ""} />
        </div>
        <input 
          type="text" 
          className="form-control border-0 shadow-none ps-3 bg-transparent fs-6" 
          placeholder="Search colleges, cities, or courses..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIndex(-1);
            if(!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <div className="position-absolute end-0 me-5 pe-5">
            <div className="spinner-border text-primary spinner-border-sm opacity-75" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <button 
          className="btn btn-premium rounded-pill px-4 py-2 fw-bold"
          onClick={() => { saveRecentSearch(search); setIsFocused(false); }}
        >
          Search
        </button>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="position-absolute w-100 mt-2 bg-white rounded-4 shadow-xl border overflow-hidden"
          >
            {!search.trim() ? (
              <div className="p-3">
                {recentSearches.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-muted small fw-bold mb-2 d-flex align-items-center gap-2 px-2">
                      <History size={14} /> Recent Searches
                    </h6>
                    {recentSearches.map((term, idx) => (
                      <div 
                        key={idx}
                        className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer transition-colors ${activeIndex === idx ? 'bg-light' : 'hover-bg-light'}`}
                        onClick={() => handleSelect(term)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <span className="text-dark fw-medium">{term}</span>
                        <button 
                          className="btn btn-link p-0 text-muted hover-text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRecent = recentSearches.filter((_, i) => i !== idx);
                            setRecentSearches(newRecent);
                            localStorage.setItem('recentSearches', JSON.stringify(newRecent));
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div>
                  <h6 className="text-muted small fw-bold mb-2 d-flex align-items-center gap-2 px-2">
                    <TrendingUp size={14} /> Trending AI Searches
                  </h6>
                  <div className="d-flex flex-wrap gap-2 px-2">
                    {['Top CSE Colleges', 'Best Placements in Bangalore', 'Low Fees Colleges'].map(tag => (
                      <span 
                        key={tag} 
                        className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill cursor-pointer hover-bg-primary hover-text-white transition-colors"
                        onClick={() => handleSelect(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2">
                {isLoading && displayResults.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <div className="spinner-border spinner-border-sm text-primary mb-2" />
                    <div className="small">Fetching smart results...</div>
                  </div>
                ) : displayResults.length > 0 ? (
                  <>
                    <h6 className="text-muted small fw-bold mb-2 px-2 pt-2 text-uppercase tracking-wider">Top AI Matches</h6>
                    {displayResults.map((college, idx) => (
                      <div 
                        key={college.id}
                        className={`d-flex align-items-center gap-3 p-2 rounded-3 cursor-pointer transition-colors ${activeIndex === idx ? 'bg-primary bg-opacity-10 border-primary border-start border-3' : 'hover-bg-light border-start border-3 border-transparent'}`}
                        onClick={() => handleSelect(college.name)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <img 
                          src={college.image} 
                          alt={college.name} 
                          className="rounded-3 object-fit-cover shadow-sm border"
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <h6 className="mb-0 text-truncate fw-bold text-dark">{college.name}</h6>
                            <span className="badge bg-success bg-opacity-10 text-success small d-flex align-items-center gap-1 border border-success-subtle rounded-pill px-2">
                              <Star size={10} className="fill-success" /> {college.rating}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-3 text-muted small text-truncate">
                            <span className="d-flex align-items-center gap-1"><MapPin size={12}/> {college.location}</span>
                            <span className="fw-medium text-primary"><TrendingUp size={12} className="me-1 d-inline"/>{college.placements}</span>
                            <span className="d-none d-md-inline fw-medium">₹{(college.fees/100000).toFixed(1)}L/yr</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted ms-2 opacity-50" />
                      </div>
                    ))}
                    
                    <div className="border-top mt-2 pt-2 px-2 pb-1">
                      <button 
                        className="btn btn-light text-primary w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-colors hover-bg-primary hover-text-white"
                        onClick={() => { saveRecentSearch(search); setIsFocused(false); }}
                      >
                        See all {results.length} results <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center">
                    <div className="d-inline-flex justify-content-center align-items-center bg-light rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                      <Search size={24} className="text-muted" />
                    </div>
                    <h6 className="fw-bold mb-1">No colleges found</h6>
                    <p className="text-muted small mb-0">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .cursor-pointer { cursor: pointer; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .hover-bg-primary:hover { background-color: #0d6efd !important; color: white !important; }
        .hover-text-danger:hover { color: #dc3545 !important; }
        .transition-colors { transition: all 0.2s ease; }
        .border-transparent { border-color: transparent !important; }
        .tracking-wider { letter-spacing: 0.05em; }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
      `}</style>
    </div>
  );
};

export default PremiumSearchBar;
