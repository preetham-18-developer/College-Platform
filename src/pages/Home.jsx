import React, { useState, useEffect } from 'react'
import localColleges from '../data/colleges'
import { searchColleges } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'

import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import CollegeCard from '../components/CollegeCard'
import PremiumSearchBar from '../components/PremiumSearchBar'
import { FinancialHero } from '../components/ui/hero-section'
import { Sparkles, MapPin, Search, AlertCircle, Loader2 } from 'lucide-react'

const Home = () => {

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  
  const [selectedLocation, setSelectedLocation] = useState('')
  
  const [colleges, setColleges] = useState(localColleges)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    const fetchColleges = async () => {
      if (!debouncedSearch) {
        // We will still fetch all Indian universities, but we'll show loading state
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchColleges(debouncedSearch);
        if (results && results.length > 0) {
          // Intelligent Filter for local data based on search, courses, and abbreviations
          const term = debouncedSearch.toLowerCase();
          const filteredLocal = localColleges.filter(college => {
            const nameMatch = college.name.toLowerCase().includes(term);
            const courseMatch = college.courses.some(c => c.toLowerCase().includes(term));
            
            let abbreviation = "";
            const words = college.name.replace(/[^a-zA-Z ]/g, '').split(' ');
            words.forEach(w => { if(w[0]) abbreviation += w[0].toLowerCase(); });
            const abbrMatch = abbreviation.includes(term);

            return nameMatch || courseMatch || abbrMatch;
          });
          
          // Filter out API duplicates that already exist in local data
          const localNames = new Set(filteredLocal.map(c => c.name.toLowerCase()));
          const uniqueApiResults = results.filter(c => !localNames.has(c.name.toLowerCase()));
          
          // Combine both, local premium data first
          setColleges([...filteredLocal, ...uniqueApiResults]);
        } else {
          fallbackToLocal();
        }
      } catch (err) {
        console.error("API failed, falling back to local data", err);
        setError("Network error while searching. Showing local results instead.");
        fallbackToLocal();
      } finally {
        setIsLoading(false);
      }
    };

    const fallbackToLocal = () => {
      const term = debouncedSearch.toLowerCase();
      const filtered = localColleges.filter(college => {
        const nameMatch = college.name.toLowerCase().includes(term);
        const courseMatch = college.courses.some(c => c.toLowerCase().includes(term));
        
        let abbreviation = "";
        const words = college.name.replace(/[^a-zA-Z ]/g, '').split(' ');
        words.forEach(w => { if(w[0]) abbreviation += w[0].toLowerCase(); });
        const abbrMatch = abbreviation.includes(term);

        return nameMatch || courseMatch || abbrMatch;
      });
      setColleges(filtered);
    }

    fetchColleges();
  }, [debouncedSearch]);

  const filteredColleges = colleges.filter((college) => {
    const matchesLocation =
      selectedLocation === '' ||
      college.location.toLowerCase().includes(selectedLocation.toLowerCase())

    return matchesLocation
  })

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="col-md-6 col-xl-4 mb-4">
      <div className="premium-card h-100 d-flex flex-column" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
        <div className="bg-secondary bg-opacity-25" style={{ height: '220px' }}></div>
        <div className="card-body p-4 d-flex flex-column flex-grow-1">
          <div className="bg-secondary bg-opacity-25 rounded w-75 mb-2" style={{ height: '24px' }}></div>
          <div className="bg-secondary bg-opacity-25 rounded w-50 mb-4" style={{ height: '16px' }}></div>
          <div className="d-flex gap-2 mb-4">
            <div className="bg-secondary bg-opacity-25 rounded-pill w-25" style={{ height: '24px' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded-pill w-25" style={{ height: '24px' }}></div>
          </div>
          <div className="mt-auto">
            <div className="bg-secondary bg-opacity-25 rounded w-100 mb-2" style={{ height: '60px' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded w-100" style={{ height: '40px' }}></div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-light-subtle min-vh-100">
      <Navbar />

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      <FinancialHero
        title={
          <>
            Find the Right <span className="text-primary">Engineering College</span> for Your Future
          </>
        }
        description="Compare placements, fees, reviews, and campus life across top institutions. Make data-driven decisions for your career."
        buttonText="Sign In to Save Favorites"
        imageUrl1="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470&auto=format&fit=crop"
        imageUrl2="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop"
        searchComponent={
          <PremiumSearchBar 
            search={search} 
            setSearch={setSearch} 
            results={colleges} 
            isLoading={isLoading} 
          />
        }
      />

      {/* Category Chips Engine */}
      <div className="bg-white border-bottom shadow-sm position-relative z-1">
        <div className="container py-3 overflow-auto no-scrollbar">
          <div className="d-flex align-items-center gap-3 flex-nowrap" style={{ minWidth: 'max-content' }}>
            <span className="text-muted small fw-bold text-uppercase tracking-wider me-2">Explore:</span>
            {['IIT', 'NIT', 'IIIT', 'JNTU', 'VIT', 'MIT', 'AI & ML', 'Cyber Security', 'Top Placements'].map(tag => (
              <button 
                key={tag} 
                onClick={() => setSearch(tag)}
                className={`btn rounded-pill border fw-medium px-4 py-1 transition-all text-nowrap ${
                  search.toLowerCase() === tag.toLowerCase() 
                  ? 'btn-primary shadow-sm' 
                  : 'bg-light text-dark hover-bg-primary hover-text-white border-light'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .tracking-wider { letter-spacing: 0.05em; }
        .hover-bg-primary:hover { background-color: #0d6efd !important; color: white !important; border-color: #0d6efd !important; }
      `}</style>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-4">

          {/* Sidebar Filters */}
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '90px', zIndex: 10 }}>
              <div className="premium-card p-4">
                <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <MapPin size={20} />
                  </div>
                  <h5 className="fw-bold mb-0">Filters</h5>
                </div>
                
                <FilterPanel
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                />
              </div>
            </div>
          </div>

          {/* College Cards Grid */}
          <div className="col-lg-9">
            
            {error && (
              <div className="alert alert-warning d-flex align-items-center gap-2 border-0 shadow-sm rounded-3 mb-4">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
              <div>
                <h3 className="fw-bold mb-1">Recommended Colleges</h3>
                <p className="text-muted mb-0 small">Based on your preferences</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="premium-badge bg-primary bg-opacity-10 text-primary">
                  {!isLoading ? filteredColleges.length : '...'} Results
                </span>
                <select className="form-select premium-input border-0 bg-white w-auto shadow-sm">
                  <option>Sort by: Rating</option>
                  <option>Sort by: Fees (Low to High)</option>
                  <option>Sort by: Placements</option>
                </select>
              </div>
            </div>

            <div className="row g-4">
              {isLoading ? (
                // Skeletons
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : filteredColleges.length > 0 ? (
                filteredColleges.slice(0, visibleCount).map((college) => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                  />
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="d-inline-flex justify-content-center align-items-center bg-white rounded-circle shadow-sm mb-3" style={{ width: '80px', height: '80px' }}>
                    <Search size={32} className="text-muted" />
                  </div>
                  <h4 className="fw-bold">No colleges found</h4>
                  <p className="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
                  <button 
                    className="btn btn-premium-outline mt-2"
                    onClick={() => { setSearch(''); setSelectedLocation(''); }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {!isLoading && filteredColleges.length > visibleCount && (
              <div className="text-center mt-5">
                <button 
                  className="btn btn-premium-outline px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                >
                  Load More Colleges ({filteredColleges.length - visibleCount} remaining)
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}

export default Home
// Force HMR reload