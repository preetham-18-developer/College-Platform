import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Search, MapPin, Star, GraduationCap, Building, Trophy, 
  ChevronRight, ArrowRight, ArrowLeft, Bookmark, BookmarkCheck, Check, 
  X, MessageCircle, Send, SendHorizontal, AlertCircle, TrendingUp, BarChart3, Filter, User
} from "lucide-react";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { supabase } from "./supabaseClient";

// --- PROCEDURAL GENERATION OF 60 COLLEGES ---
const collegeBases = [
  // IITs
  { name: "IIT Bombay", shortName: "IITB", location: "Mumbai", state: "Maharashtra", type: "IIT", nirfRank: 3 },
  { name: "IIT Delhi", shortName: "IITD", location: "New Delhi", state: "Delhi", type: "IIT", nirfRank: 2 },
  { name: "IIT Madras", shortName: "IITM", location: "Chennai", state: "Tamil Nadu", type: "IIT", nirfRank: 1 },
  { name: "IIT Kanpur", shortName: "IITK", location: "Kanpur", state: "Uttar Pradesh", type: "IIT", nirfRank: 4 },
  { name: "IIT Kharagpur", shortName: "IITKGP", location: "Kharagpur", state: "West Bengal", type: "IIT", nirfRank: 5 },
  { name: "IIT Roorkee", shortName: "IITR", location: "Roorkee", state: "Uttarakhand", type: "IIT", nirfRank: 6 },
  { name: "IIT Hyderabad", shortName: "IITH", location: "Hyderabad", state: "Telangana", type: "IIT", nirfRank: 8 },
  // NITs
  { name: "NIT Trichy", shortName: "NITT", location: "Tiruchirappalli", state: "Tamil Nadu", type: "NIT", nirfRank: 9 },
  { name: "NIT Warangal", shortName: "NITW", location: "Warangal", state: "Telangana", type: "NIT", nirfRank: 12 },
  { name: "NIT Surathkal", shortName: "NITK", location: "Mangalore", state: "Karnataka", type: "NIT", nirfRank: 10 },
  { name: "NIT Calicut", shortName: "NITC", location: "Calicut", state: "Kerala", type: "NIT", nirfRank: 23 },
  { name: "NIT Rourkela", shortName: "NITR", location: "Rourkela", state: "Odisha", type: "NIT", nirfRank: 16 },
  { name: "MNIT Jaipur", shortName: "MNIT", location: "Jaipur", state: "Rajasthan", type: "NIT", nirfRank: 37 },
  { name: "MNNIT Allahabad", shortName: "MNNIT", location: "Prayagraj", state: "Uttar Pradesh", type: "NIT", nirfRank: 49 },
  { name: "VNIT Nagpur", shortName: "VNIT", location: "Nagpur", state: "Maharashtra", type: "NIT", nirfRank: 41 },
  // IIITs
  { name: "IIIT Hyderabad", shortName: "IIITH", location: "Hyderabad", state: "Telangana", type: "IIIT", nirfRank: 55 },
  { name: "IIIT Allahabad", shortName: "IIITA", location: "Prayagraj", state: "Uttar Pradesh", type: "IIIT", nirfRank: 89 },
  { name: "IIIT Bangalore", shortName: "IIITB", location: "Bangalore", state: "Karnataka", type: "IIIT", nirfRank: 74 },
  { name: "ABV-IIITM Gwalior", shortName: "IIITM", location: "Gwalior", state: "Madhya Pradesh", type: "IIIT", nirfRank: 88 },
  { name: "IIITDM Kancheepuram", shortName: "IIITDM", location: "Chennai", state: "Tamil Nadu", type: "IIIT", nirfRank: 120 },
  // Top Private
  { name: "VIT Vellore", shortName: "VIT", location: "Vellore", state: "Tamil Nadu", type: "Private", nirfRank: 11 },
  { name: "MIT Manipal", shortName: "MIT", location: "Manipal", state: "Karnataka", type: "Private", nirfRank: 51 },
  { name: "SRM University", shortName: "SRM", location: "Chennai", state: "Tamil Nadu", type: "Private", nirfRank: 28 },
  { name: "BITS Pilani", shortName: "BITS", location: "Pilani", state: "Rajasthan", type: "Private", nirfRank: 25 },
  { name: "Amity University", shortName: "AMITY", location: "Noida", state: "Uttar Pradesh", type: "Private", nirfRank: 43 },
  { name: "LPU Jalandhar", shortName: "LPU", location: "Jalandhar", state: "Punjab", type: "Private", nirfRank: 50 },
  { name: "Chandigarh University", shortName: "CU", location: "Chandigarh", state: "Punjab", type: "Private", nirfRank: 38 },
  { name: "Christ University", shortName: "CHRIST", location: "Bangalore", state: "Karnataka", type: "Private", nirfRank: 60 },
  { name: "Symbiosis Institute", shortName: "SIT", location: "Pune", state: "Maharashtra", type: "Private", nirfRank: 70 },
  { name: "NMIMS Mumbai", shortName: "NMIMS", location: "Mumbai", state: "Maharashtra", type: "Private", nirfRank: 85 },
  { name: "KIIT Bhubaneswar", shortName: "KIIT", location: "Bhubaneswar", state: "Odisha", type: "Private", nirfRank: 39 },
  { name: "Thapar Institute", shortName: "TIET", location: "Patiala", state: "Punjab", type: "Private", nirfRank: 20 },
  { name: "PSG College", shortName: "PSG", location: "Coimbatore", state: "Tamil Nadu", type: "Private", nirfRank: 63 },
  { name: "MSRIT Bangalore", shortName: "MSRIT", location: "Bangalore", state: "Karnataka", type: "Private", nirfRank: 78 },
  { name: "RV College", shortName: "RVCE", location: "Bangalore", state: "Karnataka", type: "Private", nirfRank: 96 },
  // Medical/Management
  { name: "AIIMS Delhi", shortName: "AIIMS", location: "New Delhi", state: "Delhi", type: "Central", nirfRank: 1 },
  { name: "JIPMER", shortName: "JIPMER", location: "Puducherry", state: "Puducherry", type: "Central", nirfRank: 5 },
  { name: "IIM Ahmedabad", shortName: "IIMA", location: "Ahmedabad", state: "Gujarat", type: "Central", nirfRank: 1 },
  { name: "IIM Bangalore", shortName: "IIMB", location: "Bangalore", state: "Karnataka", type: "Central", nirfRank: 2 },
  { name: "IIM Calcutta", shortName: "IIMC", location: "Kolkata", state: "West Bengal", type: "Central", nirfRank: 3 },
  { name: "XLRI Jamshedpur", shortName: "XLRI", location: "Jamshedpur", state: "Jharkhand", type: "Private", nirfRank: 9 },
  { name: "FMS Delhi", shortName: "FMS", location: "New Delhi", state: "Delhi", type: "Central", nirfRank: 15 },
  { name: "MDI Gurgaon", shortName: "MDI", location: "Gurgaon", state: "Haryana", type: "Private", nirfRank: 13 },
  { name: "SPJIMR Mumbai", shortName: "SPJIMR", location: "Mumbai", state: "Maharashtra", type: "Private", nirfRank: 20 },
  { name: "IMT Ghaziabad", shortName: "IMT", location: "Ghaziabad", state: "Uttar Pradesh", type: "Private", nirfRank: 35 },
  // State/Deemed
  { name: "Jadavpur University", shortName: "JU", location: "Kolkata", state: "West Bengal", type: "State", nirfRank: 10 },
  { name: "Delhi Technological University", shortName: "DTU", location: "New Delhi", state: "Delhi", type: "State", nirfRank: 29 },
  { name: "Anna University", shortName: "AU", location: "Chennai", state: "Tamil Nadu", type: "State", nirfRank: 14 },
  { name: "Osmania University", shortName: "OU", location: "Hyderabad", state: "Telangana", type: "State", nirfRank: 64 },
  { name: "Panjab University", shortName: "PU", location: "Chandigarh", state: "Punjab", type: "State", nirfRank: 44 },
  { name: "University of Hyderabad", shortName: "UOH", location: "Hyderabad", state: "Telangana", type: "Central", nirfRank: 20 },
  { name: "Banaras Hindu University", shortName: "BHU", location: "Varanasi", state: "Uttar Pradesh", type: "Central", nirfRank: 11 },
  { name: "Aligarh Muslim University", shortName: "AMU", location: "Aligarh", state: "Uttar Pradesh", type: "Central", nirfRank: 19 },
  { name: "Savitribai Phule Pune University", shortName: "SPPU", location: "Pune", state: "Maharashtra", type: "State", nirfRank: 35 },
  { name: "University of Calcutta", shortName: "CU", location: "Kolkata", state: "West Bengal", type: "State", nirfRank: 12 },
  { name: "Jamia Millia Islamia", shortName: "JMI", location: "New Delhi", state: "Delhi", type: "Central", nirfRank: 12 },
  { name: "Vellore Institute of Technology", shortName: "VIT", location: "Vellore", state: "Tamil Nadu", type: "Deemed", nirfRank: 11 },
  { name: "Bharathiar University", shortName: "BU", location: "Coimbatore", state: "Tamil Nadu", type: "State", nirfRank: 21 },
  { name: "Mysore University", shortName: "UOM", location: "Mysore", state: "Karnataka", type: "State", nirfRank: 54 },
  { name: "Andhra University", shortName: "AU", location: "Visakhapatnam", state: "Andhra Pradesh", type: "State", nirfRank: 43 },
];

const generateColleges = () => {
  return collegeBases.map((base, idx) => {
    // Deterministic random logic based on index
    const hash = (str) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const h = hash(base.name);
    
    let isMed = base.name.includes("AIIMS") || base.name.includes("JIPMER");
    let isMgmt = base.name.includes("IIM") || base.name.includes("XLRI") || base.name.includes("FMS") || base.name.includes("MDI") || base.name.includes("SPJIMR") || base.name.includes("IMT");
    let isTech = !isMed && !isMgmt;

    let courses = [];
    if (isTech) courses = ["B.Tech", "M.Tech", "PhD", "MBA"];
    else if (isMed) courses = ["MBBS", "MD", "MS", "BDS"];
    else if (isMgmt) courses = ["MBA", "PGDM", "Ph.D", "Executive MBA"];

    let acceptedExams = [];
    if (isTech) acceptedExams = ["JEE Main", "JEE Advanced", "GATE"];
    if (isMed) acceptedExams = ["NEET", "NEET PG"];
    if (isMgmt) acceptedExams = ["CAT", "XAT", "GMAT"];
    
    // Fees calculation
    const baseFee = isTech ? (base.type === 'IIT' ? 220000 : base.type === 'NIT' ? 150000 : 350000) : 
                    isMed ? (base.type === 'Central' ? 10000 : 1500000) : 1200000;
                    
    const avgPack = isTech ? (base.type === 'IIT' ? 18 + (h%8) : base.type === 'NIT' ? 12 + (h%5) : 8 + (h%6)) :
                    isMed ? 12 + (h%10) : 22 + (h%15);

    return {
      id: idx + 1,
      name: base.name,
      shortName: base.shortName,
      location: `${base.location}, ${base.state}`,
      state: base.state,
      type: base.type,
      courses: courses,
      rating: 3.8 + (h % 12) / 10,
      totalRatings: 100 + (h % 900),
      fees: {
        btech: isTech ? baseFee + (h % 5) * 10000 : null,
        mba: isMgmt || isTech ? baseFee * 1.5 + (h % 3) * 20000 : null,
        mtech: isTech ? baseFee * 0.8 : null,
        mbbs: isMed ? baseFee : null
      },
      placements: {
        avgPackage: avgPack,
        highestPackage: avgPack * (3 + (h%3)),
        placementRate: 85 + (h % 15)
      },
      established: 1950 + (h % 60),
      naacGrade: ["A++", "A+", "A", "B++", "B+"][h % 5],
      nirfRank: base.nirfRank,
      acceptedExams,
      cutoffs: {
        general: isTech ? 1000 + (h*10 % 20000) : isMed ? 500 + (h % 5000) : 95,
        obc: isTech ? 3000 + (h*15 % 25000) : isMed ? 1500 + (h % 6000) : 90,
        sc: isTech ? 10000 + (h*20 % 50000) : isMed ? 4000 + (h % 10000) : 80,
        st: isTech ? 15000 + (h*25 % 60000) : isMed ? 6000 + (h % 15000) : 75
      },
      image: `https://picsum.photos/seed/${idx + 1}/400/250`,
      logo: `https://ui-avatars.com/api/?name=${base.shortName}&background=6366f1&color=fff&size=80`,
      tags: [isTech ? "Tech Leader" : "Top Ranked", "High Placement"],
      overview: `${base.name} is a premier institution located in ${base.location}, ${base.state}. It is well known for its high academic standards and excellent placement records. The campus features state-of-the-art facilities and a vibrant student life.`,
      facilities: ["Library", "Hostel", "Sports Complex", "Lab", "Wi-Fi Campus", "Cafeteria"].slice(0, 4 + (h%3)),
      topRecruiters: ["Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "Accenture", "Meta"].sort(() => 0.5 - Math.random()).slice(0, 4),
      reviews: [
        { author: `Student ${h%100}`, rating: 5, comment: "Excellent faculty and amazing campus life. Placements are top notch.", year: "2023" },
        { author: `Alumni ${h%50}`, rating: 4, comment: "Academics are tough but totally worth it. The infrastructure is good.", year: "2022" },
        { author: `Student ${h%75}`, rating: 4, comment: "Great exposure and peer group. Hostel facilities could be slightly improved.", year: "2024" }
      ]
    };
  });
};

const COLLEGES = generateColleges();

// --- APP COMPONENT ---
export default function App() {
  const [view, setView] = useState("home");
  const [savedColleges, setSavedColleges] = useState(new Set());
  const [compareList, setCompareList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    type: [], state: [], course: [], exam: [], 
    feeMax: 2500000, minRating: 0, minPackage: 0
  });
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hi there! I am EduBot 🤖. How can I help you with college admissions today?' }
  ]);

  // Toast Function
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  }, []);

  // Authentication State Management
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user ?? null);
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // History handling
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
        if (e.state.collegeId) {
          const col = COLLEGES.find(c => c.id === e.state.collegeId);
          setSelectedCollege(col);
        }
      } else {
        setView("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    // Set initial state based on URL or default to home
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view') || "home";
    const currentHash = window.location.hash; // Preserve Supabase OAuth tokens!
    setView(initialView);
    window.history.replaceState({ view: initialView }, "", `?view=${initialView}${currentHash}`);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigation
  const navigateTo = (newView, college = null) => {
    if (college) setSelectedCollege(college);
    setView(newView);
    window.history.pushState({ view: newView, collegeId: college?.id }, "", `?view=${newView}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved toggler
  const toggleSave = (e, id) => {
    e.stopPropagation();
    const newSaved = new Set(savedColleges);
    if (newSaved.has(id)) {
      newSaved.delete(id);
      showToast("Removed from saved", "info");
    } else {
      newSaved.add(id);
      showToast("College saved!", "success");
    }
    setSavedColleges(newSaved);
  };

  // Compare toggler
  const toggleCompare = (e, id) => {
    e.stopPropagation();
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(c => c !== id));
      showToast("Removed from comparison", "info");
    } else {
      if (compareList.length >= 3) {
        showToast("You can compare up to 3 colleges max.", "error");
        return;
      }
      setCompareList([...compareList, id]);
      showToast("Added to compare", "success");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-200 font-sans selection:bg-fuchsia-500 selection:text-white">
      {/* Global CSS for Animations and Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6, .font-sora { font-family: 'Sora', sans-serif; }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0A0F1E; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .gradient-text {
          background: linear-gradient(to right, #6366F1, #8B5CF6, #D946EF);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
        
        .mesh-bg {
          background-color: #0A0F1E;
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,0.2) 0, transparent 50%);
        }

        .shimmer {
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0A0F1E]/80 border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
              <GraduationCap className="h-8 w-8 text-fuchsia-500 mr-2" />
              <span className="font-sora font-bold text-2xl gradient-text tracking-tight">EduRank</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <button onClick={() => navigateTo('home')} className={`text-sm font-medium transition-colors ${view==='home' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Home</button>
              <button onClick={() => navigateTo('colleges')} className={`text-sm font-medium transition-colors ${view==='colleges' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Colleges</button>
              <button onClick={() => navigateTo('compare')} className={`text-sm font-medium transition-colors ${view==='compare' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Compare</button>
              <button onClick={() => navigateTo('predictor')} className={`text-sm font-medium transition-colors ${view==='predictor' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Predictor</button>
              {isLoggedIn ? (
                <div className="relative">
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white pr-2">Profile</span>
                  </div>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#0A0F1E]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeSlideDown_0.2s_ease-out]">
                      <div className="p-4 border-b border-white/10 bg-white/5">
                        <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate" title={currentUser?.email}>{currentUser?.email || "Student"}</p>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { setShowProfileMenu(false); navigateTo('colleges'); }} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                          <Bookmark className="w-4 h-4" /> My Saved Colleges
                        </button>
                        <button onClick={() => { setShowProfileMenu(false); navigateTo('profile'); }} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                          <User className="w-4 h-4" /> Profile & Settings
                        </button>
                        <div className="h-[1px] bg-white/10 my-2 mx-1"></div>
                        <button onClick={async () => { 
                          await supabase.auth.signOut();
                          setIsLoggedIn(false); 
                          setCurrentUser(null);
                          setShowProfileMenu(false); 
                          showToast("Signed out successfully"); 
                          navigateTo('home');
                        }} className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                          <X className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => navigateTo('auth')} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-5 py-2 rounded-full font-medium hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all transform hover:scale-105">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen overflow-hidden">
        <div key={view} className="animate-[pageTransition_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-top">
          {view === "home" && <HomeView navigateTo={navigateTo} setSearchQuery={setSearchQuery} setActiveFilters={setActiveFilters} />}
          {view === "colleges" && (
            <CollegesView 
              navigateTo={navigateTo} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              savedColleges={savedColleges}
              toggleSave={toggleSave}
              compareList={compareList}
              toggleCompare={toggleCompare}
            />
          )}
          {view === "detail" && (
            <DetailView 
              college={selectedCollege} 
              savedColleges={savedColleges} 
              toggleSave={toggleSave}
              compareList={compareList}
              toggleCompare={toggleCompare}
              navigateTo={navigateTo}
            />
          )}
          {view === "compare" && (
            <CompareView 
              compareList={compareList} 
              setCompareList={setCompareList}
              navigateTo={navigateTo} 
            />
          )}
          {view === "predictor" && <PredictorView navigateTo={navigateTo} toggleCompare={toggleCompare} compareList={compareList} />}
          {view === "profile" && <ProfilePage navigateTo={navigateTo} onSignOut={async () => { await supabase.auth.signOut(); navigateTo('home'); }} />}
          {view === "auth" && <AuthPage initialMode="login" navigateTo={navigateTo} />}
        </div>
      </main>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && view !== "compare" && (
        <div className="fixed bottom-0 left-0 w-full bg-indigo-900/90 backdrop-blur-md border-t border-indigo-500/30 p-4 z-40 transform transition-transform shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {compareList.map((id, i) => {
                  const c = COLLEGES.find(col => col.id === id);
                  return <img key={id} src={c.logo} alt={c.shortName} className="w-10 h-10 rounded-full border-2 border-indigo-900 relative z-[1]" style={{zIndex: 3-i}} />
                })}
              </div>
              <p className="font-medium">{compareList.length} colleges selected for comparison</p>
            </div>
            <button 
              onClick={() => navigateTo('compare')}
              className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold flex items-center hover:bg-slate-100 transition-colors"
            >
              Compare Now <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Widget */}
      <Chatbot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        history={chatHistory} 
        setHistory={setChatHistory} 
      />

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-20 right-4 z-[60] px-6 py-3 rounded-lg shadow-xl border backdrop-blur-md flex items-center gap-3 animate-[slideIn_0.3s_ease-out]
          ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100' : 
            toast.type === 'info' ? 'bg-slate-800/80 border-slate-600/50 text-slate-100' :
            'bg-emerald-900/80 border-emerald-500/50 text-emerald-100'}`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pageTransition { 
          0% { opacity: 0; transform: translateY(15px) scale(0.99); filter: blur(4px); } 
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

// --- 1. HOME VIEW ---
function HomeView({ navigateTo, setSearchQuery, setActiveFilters }) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return COLLEGES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.shortName.toLowerCase().includes(q) || 
      c.location.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
      <span key={i} className="text-fuchsia-400 font-bold">{part}</span> : part
    );
  };

  return (
    <div className="mesh-bg min-h-[calc(100vh-64px)] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-sora font-extrabold mb-6 tracking-tight">
          Find Your <span className="gradient-text">Dream College</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Explore 600+ colleges, predict admissions, and compare your best options using AI-driven insights.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-3xl mx-auto relative z-30" ref={searchRef}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative flex items-center bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl transition-all duration-300 focus-within:border-indigo-500 focus-within:bg-[#1E293B]">
              <Search className="w-6 h-6 text-slate-400 ml-4 mr-2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                onFocus={() => { if(search.length >= 2) setDropdownOpen(true); }}
                onKeyDown={(e) => e.key === 'Escape' && setDropdownOpen(false)}
                placeholder="Search colleges, courses, locations..."
                className="w-full bg-transparent text-lg text-white outline-none placeholder-slate-500 py-3"
              />
              <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && search.length >= 2 && (
            <div className="absolute w-full mt-2 bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-[slideDown_0.2s_ease-out]">
              {searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map((c) => (
                    <li 
                      key={c.id} 
                      onClick={() => navigateTo('detail', c)}
                      className="px-6 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-colors"
                    >
                      <img src={c.logo} alt={c.shortName} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium text-lg">{highlightText(c.name, search)}</div>
                        <div className="text-sm text-slate-400">{highlightText(c.location, search)}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${c.type === 'IIT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : c.type === 'NIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                        {c.type}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-slate-400 flex flex-col items-center">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p>No colleges found matching "{search}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { tag: "🎓 All", q: "" },
            { tag: "⚙️ Engineering", q: "B.Tech" },
            { tag: "💊 Medical", q: "MBBS" },
            { tag: "📊 Management", q: "MBA" },
            { tag: "🔬 Research", q: "PhD" },
            { tag: "🏆 Top Ranked", q: "top" }
          ].map((item, i) => (
            <button key={i} onClick={() => {
              if (item.q === "top") {
                setActiveFilters(prev => ({...prev, minRating: 4.5}));
                setSearchQuery("");
              } else {
                setActiveFilters({type: [], state: [], course: [], exam: [], feeMax: 2500000, minRating: 0, minPackage: 0});
                setSearchQuery(item.q);
              }
              navigateTo('colleges');
            }} className="bg-[#1E293B]/60 hover:bg-[#1E293B] border border-white/5 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:border-indigo-500/50">
              {item.tag}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-12">
          {[
            { label: "Colleges", value: "600+" },
            { label: "Exams Covered", value: "50+" },
            { label: "Students Helped", value: "2M+" },
            { label: "Success Rate", value: "95%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-sora font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-sora font-bold text-white mb-2">Top Premier Institutes</h2>
            <p className="text-slate-400">Discover India's most prestigious engineering colleges</p>
          </div>
          <button onClick={() => navigateTo('colleges')} className="text-fuchsia-400 hover:text-fuchsia-300 font-medium flex items-center group">
            View All <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-8 snap-x">
          {COLLEGES.slice(0, 8).map(c => (
            <div key={c.id} className="min-w-[320px] max-w-[320px] snap-start bg-[#1E293B]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)] hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group" onClick={() => navigateTo('detail', c)}>
              <div className="relative h-48 overflow-hidden">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{c.type}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">{c.shortName}</h3>
                <p className="text-slate-400 text-sm flex items-center mb-4"><MapPin className="w-4 h-4 mr-1" /> {c.location}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-amber-400 font-bold"><Star className="w-4 h-4 fill-current mr-1" /> {c.rating}</div>
                  <div className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-md text-sm">{c.placements.avgPackage} LPA Avg</div>
                </div>
                <button className="w-full py-2.5 bg-white/5 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}

// --- 2. COLLEGES VIEW ---
function CollegesView({ navigateTo, searchQuery, setSearchQuery, activeFilters, setActiveFilters, savedColleges, toggleSave, compareList, toggleCompare }) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeFilters, searchQuery]);

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter(c => {
      // Search (includes name, shortname, location, and courses!)
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(sq) || c.shortName.toLowerCase().includes(sq) || c.location.toLowerCase().includes(sq);
        const matchesCourse = c.courses.some(course => course.toLowerCase().includes(sq));
        if (!matchesName && !matchesCourse) return false;
      }
      // Type
      if (activeFilters.type.length > 0 && !activeFilters.type.includes(c.type)) return false;
      // State
      if (activeFilters.state.length > 0 && !activeFilters.state.includes(c.state)) return false;
      // Rating
      if (c.rating < activeFilters.minRating) return false;
      // Package
      if (c.placements.avgPackage < activeFilters.minPackage) return false;
      // Fees (B.Tech base)
      if (c.fees.btech && c.fees.btech > activeFilters.feeMax) return false;
      return true;
    });
  }, [searchQuery, activeFilters]);

  const displayedColleges = filteredColleges.slice(0, page * ITEMS_PER_PAGE);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const arr = prev[category];
      return { ...prev, [category]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const allStates = [...new Set(COLLEGES.map(c => c.state))].sort();
  const allTypes = ["IIT", "NIT", "IIIT", "Private", "Central", "State", "Deemed"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-[#1E293B]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sora font-bold text-lg flex items-center"><Filter className="w-5 h-5 mr-2 text-indigo-400" /> Filters</h3>
            <button onClick={() => setActiveFilters({type: [], state: [], course: [], exam: [], feeMax: 2500000, minRating: 0, minPackage: 0})} className="text-xs text-slate-400 hover:text-white underline">Clear All</button>
          </div>

          {/* Search inside */}
          <div className="mb-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" placeholder="Search name..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Institution Type</h4>
            <div className="space-y-2">
              {allTypes.map(t => (
                <label key={t} className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={activeFilters.type.includes(t)} onChange={() => toggleFilter('type', t)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${activeFilters.type.includes(t) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 group-hover:border-indigo-400'}`}>
                    {activeFilters.type.includes(t) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-slate-300 text-sm group-hover:text-white">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Min Rating</h4>
            <div className="flex gap-2">
              {[3, 4, 4.5].map(r => (
                <button key={r} onClick={() => setActiveFilters({...activeFilters, minRating: activeFilters.minRating === r ? 0 : r})} className={`flex-1 py-1.5 rounded text-sm font-medium border flex items-center justify-center gap-1 transition-colors ${activeFilters.minRating === r ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                  {r} <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Package Slider */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">Min Avg Package</span>
              <span className="text-emerald-400 font-bold">{activeFilters.minPackage} LPA+</span>
            </div>
            <input type="range" min="0" max="30" step="1" value={activeFilters.minPackage} onChange={e => setActiveFilters({...activeFilters, minPackage: Number(e.target.value)})} className="w-full accent-emerald-500" />
          </div>

        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1">
        <button onClick={() => navigateTo('home')} className="text-slate-400 hover:text-white font-medium flex items-center mb-6 transition-colors w-fit md:hidden">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-sora font-bold text-white">Showing {filteredColleges.length} Colleges</h2>
          <select className="bg-[#1E293B] border border-white/10 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500 cursor-pointer">
            <option>Sort by: NIRF Rank ↑</option>
            <option>Sort by: Rating ↓</option>
            <option>Sort by: Package ↓</option>
            <option>Sort by: Fees ↓</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#1E293B]/50 border border-white/5 rounded-2xl overflow-hidden h-[380px] flex flex-col">
                <div className="h-40 shimmer w-full"></div>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="h-6 shimmer w-3/4 rounded"></div>
                  <div className="h-4 shimmer w-1/2 rounded"></div>
                  <div className="flex gap-2"><div className="h-6 shimmer w-16 rounded-full"></div><div className="h-6 shimmer w-16 rounded-full"></div></div>
                  <div className="mt-auto h-10 shimmer w-full rounded-xl"></div>
                </div>
              </div>
            ))
          ) : displayedColleges.length > 0 ? (
            displayedColleges.map(c => (
              <div key={c.id} className="group bg-[#1E293B]/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => navigateTo('detail', c)}>
                {/* Card Top */}
                <div className="relative h-40 overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent"></div>
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase border border-white/10">{c.type}</span>
                  <button onClick={(e) => toggleSave(e, c.id)} className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-fuchsia-600 transition-colors border border-white/10">
                    {savedColleges.has(c.id) ? <BookmarkCheck className="w-4 h-4 text-fuchsia-400" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <div className="absolute bottom-[-20px] left-4 border-4 border-[#1E293B] rounded-full overflow-hidden w-12 h-12 bg-[#1E293B]">
                    <img src={c.logo} alt="logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                {/* Card Body */}
                <div className="pt-8 p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-indigo-400 transition-colors">{c.name}</h3>
                  <p className="text-slate-400 text-xs mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" />{c.location}</p>
                  
                  <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm">
                    <div><span className="text-slate-500 text-xs block">Avg Package</span><span className="text-emerald-400 font-semibold">{c.placements.avgPackage} LPA</span></div>
                    <div><span className="text-slate-500 text-xs block">B.Tech Fees</span><span className="text-white font-semibold">{c.fees.btech ? `₹${(c.fees.btech/100000).toFixed(2)}L/yr` : 'N/A'}</span></div>
                    <div><span className="text-slate-500 text-xs block">Rating</span><span className="text-amber-400 font-semibold flex items-center"><Star className="w-3 h-3 fill-current mr-1" />{c.rating}</span></div>
                    <div><span className="text-slate-500 text-xs block">NIRF Rank</span><span className="text-white font-semibold">#{c.nirfRank}</span></div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto mb-4 overflow-hidden">
                    {c.tags.slice(0,2).map(tag => <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-sm">{tag}</span>)}
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={(e) => toggleCompare(e, c.id)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${compareList.includes(c.id) ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/50' : 'bg-[#0A0F1E] text-slate-300 border-white/10 hover:bg-white/5'}`}>
                      {compareList.includes(c.id) ? 'Added' : '+ Compare'}
                    </button>
                    <button className="flex-[2] py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-[#1E293B]/20 rounded-2xl border border-white/5 border-dashed">
              <Search className="w-12 h-12 mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-white mb-2">No colleges found</h3>
              <p>Try adjusting your filters or search query.</p>
              <button onClick={() => {setSearchQuery(''); setActiveFilters({type: [], state: [], course: [], exam: [], feeMax: 2500000, minRating: 0, minPackage: 0});}} className="mt-4 text-indigo-400 hover:text-indigo-300 underline">Clear all filters</button>
            </div>
          )}
        </div>

        {!loading && displayedColleges.length < filteredColleges.length && (
          <div className="mt-10 text-center">
            <button onClick={() => setPage(p => p + 1)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-full font-medium transition-colors">
              Load More Colleges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 3. DETAIL VIEW ---
function DetailView({ college, savedColleges, toggleSave, compareList, toggleCompare, navigateTo }) {
  if (!college) return <div className="text-white text-center py-20">College not found</div>;

  return (
    <div className="pb-20 animate-[fadeIn_0.4s_ease-out]">
      {/* Hero Header */}
      <div className="relative h-[400px]">
        <button onClick={() => navigateTo('colleges')} className="absolute top-6 left-4 sm:left-8 z-10 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium flex items-center transition-colors border border-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Colleges
        </button>
        <img src={college.image} alt="campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end gap-6">
          <img src={college.logo} alt="logo" className="w-32 h-32 rounded-2xl border-4 border-[#0A0F1E] shadow-2xl bg-white" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider">{college.type}</span>
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">NAAC {college.naacGrade}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-sora font-extrabold text-white mb-2">{college.name}</h1>
            <p className="text-slate-300 text-lg flex items-center"><MapPin className="w-5 h-5 mr-2 text-slate-400" />{college.location}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={(e) => toggleSave(e, college.id)} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${savedColleges.has(college.id) ? 'bg-fuchsia-600 text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}>
              <Bookmark className={`w-5 h-5 ${savedColleges.has(college.id) ? 'fill-current' : ''}`} /> {savedColleges.has(college.id) ? 'Saved' : 'Save'}
            </button>
            <button onClick={(e) => toggleCompare(e, college.id)} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${compareList.includes(college.id) ? 'bg-indigo-600 text-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white'}`}>
              <BarChart3 className="w-5 h-5" /> {compareList.includes(college.id) ? 'Added to Compare' : 'Compare'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "NIRF Rank", val: `#${college.nirfRank}`, icon: Trophy, color: "text-amber-400" },
              { label: "Rating", val: `${college.rating}/5.0`, icon: Star, color: "text-yellow-400" },
              { label: "Avg Package", val: `${college.placements.avgPackage} LPA`, icon: TrendingUp, color: "text-emerald-400" },
              { label: "Est. Year", val: college.established, icon: Building, color: "text-blue-400" }
            ].map((s,i) => (
              <div key={i} className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
                <div className="text-xl font-bold text-white mb-1">{s.val}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="bg-[#1E293B]/40 border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-sora font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 leading-relaxed text-lg">{college.overview}</p>
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Campus Facilities</h3>
              <div className="flex flex-wrap gap-3">
                {college.facilities.map(f => (
                  <span key={f} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-sm">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Placements */}
          <div className="bg-[#1E293B]/40 border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-sora font-bold text-white mb-6">Placements Record</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <div className="text-emerald-400 text-3xl font-black mb-1">{college.placements.highestPackage} LPA</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Highest Package</div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                <div className="text-indigo-400 text-3xl font-black mb-1">{college.placements.avgPackage} LPA</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Average Package</div>
              </div>
              <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-6 text-center">
                <div className="text-fuchsia-400 text-3xl font-black mb-1">{college.placements.placementRate}%</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Placement Rate</div>
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Recruiters</h3>
            <div className="flex flex-wrap gap-4">
              {college.topRecruiters.map(r => (
                <div key={r} className="bg-white px-4 py-2 rounded-lg flex items-center justify-center w-24 h-12 hover:scale-105 transition-transform">
                  <span className="font-bold text-slate-800">{r}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Reviews */}
          <div className="bg-[#1E293B]/40 border border-white/5 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-sora font-bold text-white">Student Reviews</h2>
              <button className="text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg text-white font-medium transition-colors">Write a Review</button>
            </div>
            <div className="space-y-4">
              {college.reviews.map((r, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${r.author}&background=random&color=fff`} className="w-10 h-10 rounded-full" alt="avatar" />
                      <div>
                        <div className="font-bold text-white">{r.author}</div>
                        <div className="text-xs text-slate-400">Class of {r.year}</div>
                      </div>
                    </div>
                    <div className="flex text-amber-400"><Star className="w-4 h-4 fill-current" /> <span className="ml-1 text-sm font-bold text-white">{r.rating}.0</span></div>
                  </div>
                  <p className="text-slate-300 text-sm italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Cutoffs & Admissions) */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-900/50 to-[#1E293B] border border-indigo-500/20 rounded-3xl p-6">
            <h3 className="text-xl font-sora font-bold text-white mb-4">Admissions & Fees</h3>
            <div className="space-y-4 mb-6">
              {college.fees.btech && (
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-300">B.Tech (Annual)</span>
                  <span className="text-white font-bold text-lg">₹{(college.fees.btech/100000).toFixed(2)}L</span>
                </div>
              )}
              {college.fees.mba && (
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-300">MBA (Annual)</span>
                  <span className="text-white font-bold text-lg">₹{(college.fees.mba/100000).toFixed(2)}L</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-2">Accepted Exams</div>
              <div className="flex flex-wrap gap-2">
                {college.acceptedExams.map(ex => <span key={ex} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-200">{ex}</span>)}
              </div>
            </div>
            <button onClick={() => navigateTo('predictor')} className="w-full mt-6 bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
              Check Chances of Admission
            </button>
          </div>

          <div className="bg-[#1E293B]/40 border border-white/5 rounded-3xl p-6 overflow-hidden">
            <h3 className="text-xl font-sora font-bold text-white mb-4">Expected Cutoffs (Rank)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Category</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Closing Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium text-white">General</td>
                    <td className="px-4 py-3 text-right font-mono">{college.cutoffs.general.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">OBC-NCL</td>
                    <td className="px-4 py-3 text-right font-mono">{college.cutoffs.obc.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium text-white">SC</td>
                    <td className="px-4 py-3 text-right font-mono">{college.cutoffs.sc.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-white">ST</td>
                    <td className="px-4 py-3 text-right font-mono">{college.cutoffs.st.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

// --- 4. COMPARE VIEW ---
function CompareView({ compareList, setCompareList, navigateTo }) {
  if (compareList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-32 h-32 bg-[#1E293B] rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-16 h-16 text-indigo-500" />
        </div>
        <h2 className="text-3xl font-sora font-bold text-white mb-4">Compare Colleges</h2>
        <p className="text-slate-400 max-w-lg mb-8 text-lg">Add up to 3 colleges from the listing page to compare their fees, placements, ratings, and facilities side-by-side.</p>
        <button onClick={() => navigateTo('colleges')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all hover:scale-105">
          Browse Colleges
        </button>
      </div>
    );
  }

  const selectedColleges = compareList.map(id => COLLEGES.find(c => c.id === id));
  
  // Helper to find the best value across the selected colleges for highlighting
  const bestValue = (field) => {
    if (field === 'rating' || field === 'avgPackage' || field === 'placementRate') {
      return Math.max(...selectedColleges.map(c => field === 'avgPackage' ? c.placements.avgPackage : field === 'placementRate' ? c.placements.placementRate : c[field]));
    }
    if (field === 'fees' || field === 'nirfRank') {
      return Math.min(...selectedColleges.map(c => field === 'fees' ? (c.fees.btech || Infinity) : c.nirfRank));
    }
    return null;
  };

  const isBest = (c, field) => {
    const best = bestValue(field);
    if (field === 'rating') return c.rating === best;
    if (field === 'avgPackage') return c.placements.avgPackage === best;
    if (field === 'placementRate') return c.placements.placementRate === best;
    if (field === 'fees') return c.fees.btech === best;
    if (field === 'nirfRank') return c.nirfRank === best;
    return false;
  };

  const Row = ({ label, field, formatter }) => (
    <div className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <div className="w-48 flex-shrink-0 p-4 font-semibold text-slate-400 flex items-center">{label}</div>
      {selectedColleges.map(c => (
        <div key={c.id} className={`flex-1 p-4 flex items-center justify-center text-center border-l border-white/5 ${isBest(c, field) ? 'bg-fuchsia-500/5' : ''}`}>
          <span className={`font-medium ${isBest(c, field) ? 'text-fuchsia-400 font-bold' : 'text-slate-200'}`}>
            {formatter ? formatter(c) : c[field]}
          </span>
        </div>
      ))}
      {selectedColleges.length < 3 && <div className="flex-1 p-4 border-l border-white/5 bg-black/10"></div>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-[fadeIn_0.3s_ease-out]">
      <button onClick={() => navigateTo('colleges')} className="text-slate-400 hover:text-white font-medium flex items-center mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Colleges
      </button>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-sora font-extrabold text-white mb-2">Detailed Comparison</h1>
          <p className="text-slate-400 text-lg">Compare parameters side by side to make an informed decision.</p>
        </div>
        <button onClick={() => setCompareList([])} className="text-slate-400 hover:text-red-400 underline font-medium">Clear All</button>
      </div>

      <div className="bg-[#1E293B]/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Headers */}
        <div className="flex border-b border-white/10 bg-[#1E293B]">
          <div className="w-48 flex-shrink-0 p-4"></div>
          {selectedColleges.map(c => (
            <div key={c.id} className="flex-1 p-6 relative border-l border-white/5 flex flex-col items-center text-center group">
              <button onClick={() => setCompareList(compareList.filter(id => id !== c.id))} className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-red-500/80 rounded-full text-slate-300 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <img src={c.logo} className="w-20 h-20 rounded-xl mb-4 border-2 border-white/10" alt="logo" />
              <h3 className="text-xl font-bold text-white leading-tight mb-1">{c.shortName}</h3>
              <p className="text-xs text-slate-400">{c.location}</p>
            </div>
          ))}
          {selectedColleges.length < 3 && (
            <div className="flex-1 p-6 border-l border-white/5 border-dashed flex flex-col items-center justify-center bg-black/20 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigateTo('colleges')}>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-500 group-hover:border-indigo-400 flex items-center justify-center mb-3 transition-colors">
                <Search className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-400 group-hover:text-white">Add College</span>
            </div>
          )}
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-white/5">
          <Row label="Type" formatter={c => <span className="px-3 py-1 bg-white/10 rounded-full text-xs">{c.type}</span>} />
          <Row label="NIRF Rank" field="nirfRank" formatter={c => `#${c.nirfRank}`} />
          <Row label="Rating" field="rating" formatter={c => <div className="flex items-center justify-center gap-1"><Star className={`w-4 h-4 ${isBest(c,'rating')?'fill-fuchsia-400':'fill-amber-400 text-amber-400'}`} />{c.rating}</div>} />
          <Row label="Annual Fees" field="fees" formatter={c => c.fees.btech ? `₹${(c.fees.btech/100000).toFixed(2)} Lakhs` : 'N/A'} />
          <Row label="Avg Package" field="avgPackage" formatter={c => `${c.placements.avgPackage} LPA`} />
          <Row label="Highest Package" formatter={c => `${c.placements.highestPackage} LPA`} />
          <Row label="Placement Rate" field="placementRate" formatter={c => `${c.placements.placementRate}%`} />
          <Row label="Accepted Exams" formatter={c => c.acceptedExams.join(', ')} />
        </div>
      </div>
    </div>
  );
}

// --- 5. PREDICTOR VIEW ---
function PredictorView({ navigateTo, toggleCompare, compareList }) {
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState("JEE Main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handlePredict = () => {
    if (!rank) return;
    setLoading(true);
    setTimeout(() => {
      const userRank = parseInt(rank);
      const isJEE = exam.includes("JEE");
      const isMed = exam === "NEET";
      
      const filtered = COLLEGES.filter(c => c.acceptedExams.includes(exam));
      
      const tiers = {
        safe: filtered.filter(c => c.cutoffs[category] >= userRank * 1.2),
        moderate: filtered.filter(c => c.cutoffs[category] >= userRank * 0.8 && c.cutoffs[category] < userRank * 1.2),
        ambitious: filtered.filter(c => c.cutoffs[category] >= userRank * 0.4 && c.cutoffs[category] < userRank * 0.8)
      };

      setResults(tiers);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const ResultRow = ({ title, desc, colArray, colorClass, borderClass, bgClass }) => (
    <div className="mb-10">
      <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl border ${bgClass} ${borderClass}`}>
        <div className={`w-3 h-3 rounded-full ${colorClass} shadow-[0_0_10px_currentColor]`}></div>
        <div>
          <h3 className={`font-sora font-bold text-lg ${colorClass}`}>{title}</h3>
          <p className="text-sm text-slate-300">{desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colArray.slice(0, 4).map(c => (
          <div key={c.id} className="bg-[#1E293B]/40 border border-white/5 rounded-xl p-4 flex gap-4 items-center hover:bg-[#1E293B] transition-colors cursor-pointer group" onClick={() => navigateTo('detail', c)}>
            <img src={c.logo} className="w-16 h-16 rounded-lg object-cover" alt="logo"/>
            <div className="flex-1">
              <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{c.shortName}</h4>
              <div className="text-xs text-slate-400 mb-1">{c.name}</div>
              <div className="text-xs font-mono text-slate-300">Cutoff: ~{c.cutoffs[category].toLocaleString()}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleCompare(e, c.id); }} className="p-2 bg-white/5 hover:bg-indigo-600 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {colArray.length === 0 && <div className="col-span-2 text-slate-500 italic p-4">No colleges in this range.</div>}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={() => navigateTo('home')} className="text-slate-400 hover:text-white font-medium flex items-center mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </button>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-sora font-extrabold text-white mb-4">College Predictor AI</h1>
        <p className="text-slate-400 text-lg">Find out your admission chances based on historical cutoffs and current trends.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: step===1 ? '0%' : step===2 ? '50%' : '100%' }}></div>
        
        <div className="flex w-full justify-between max-w-lg">
          {[1,2,3].map(num => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= num ? 'bg-indigo-600 border-[#0A0F1E] text-white' : 'bg-[#1E293B] border-[#0A0F1E] text-slate-500'}`}>
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1E293B]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {step === 1 && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Step 1: Exam Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {["JEE Main", "JEE Advanced", "NEET", "CAT", "GATE", "TS EAMCET", "BITSAT", "VITEEE"].map(e => (
                <button key={e} onClick={() => setExam(e)} className={`py-4 rounded-xl border font-semibold transition-all ${exam === e ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'}`}>
                  {e}
                </button>
              ))}
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">Enter your {exam} Rank/Score</label>
              <input type="number" value={rank} onChange={e => setRank(e.target.value)} placeholder="e.g. 15000" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <button disabled={!rank} onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Continue to Profile <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Step 2: Reservation Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { id: 'general', label: 'General / Open' },
                { id: 'obc', label: 'OBC-NCL' },
                { id: 'sc', label: 'SC' },
                { id: 'st', label: 'ST' }
              ].map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} className={`py-6 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${category === c.id ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  <span className="font-bold">{c.label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all">Back</button>
              <button onClick={handlePredict} className="w-2/3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center">
                Predict My Colleges <SparklesIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Millions of Data Points...</h2>
            <p className="text-slate-400">Running AI prediction models for Rank {rank}</p>
          </div>
        )}

        {step === 3 && !loading && results && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-10 pb-6 border-b border-white/10">
              <h2 className="text-3xl font-sora font-bold text-white mb-2">Your Prediction Results</h2>
              <p className="text-slate-400">Based on {exam} Rank <span className="text-white font-mono font-bold bg-white/10 px-2 py-1 rounded">{rank}</span> in <span className="text-white font-bold uppercase">{category}</span> category</p>
            </div>

            <ResultRow title="Safe Chances 🟢" desc="Your rank is well within the closing cutoffs." colArray={results.safe} colorClass="text-emerald-400" borderClass="border-emerald-500/20" bgClass="bg-emerald-500/5" />
            
            <ResultRow title="Moderate Chances 🟡" desc="Borderline cases. Depends on current year competition." colArray={results.moderate} colorClass="text-amber-400" borderClass="border-amber-500/20" bgClass="bg-amber-500/5" />
            
            <ResultRow title="Ambitious 🔴" desc="Tough chances, but wait for special spot rounds." colArray={results.ambitious} colorClass="text-red-400" borderClass="border-red-500/20" bgClass="bg-red-500/5" />

            <div className="mt-8 text-center">
              <button onClick={() => {setStep(1); setResults(null);}} className="text-indigo-400 hover:text-white underline font-medium">Try another prediction</button>
            </div>
            
            <div className="mt-8 p-4 bg-white/5 rounded-lg text-xs text-slate-500 text-center">
              Disclaimer: These are AI-driven predictions based on historical round 6 data. Actual cutoffs may vary. Always refer to official counseling authorities.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SparklesIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

// --- 6. CHATBOT COMPONENT ---
function Chatbot({ isOpen, setIsOpen, history, setHistory }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history, isOpen, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput("");
    setIsTyping(true);

    try {
      const systemPrompt = "You are EduBot, an AI assistant for a premium Indian college discovery platform. Help students with engineering/medical admissions, colleges (IITs, NITs, BITS, VIT), exams (JEE, NEET), fees, and placements. Keep responses concise, accurate, and structured. Do not hallucinate data.";
      
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...newHistory.slice(-5) // Only send last 5 messages for context to save tokens
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error("Backend error");
      
      const data = await res.json();
      setHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setHistory(prev => [...prev, { role: 'assistant', content: "Oops! My brain is disconnected right now. Make sure the backend server (npm run dev:backend) is running so I can talk to the NVIDIA API! 🤖🔌" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 transition-transform ${isOpen ? 'scale-0' : 'scale-100 animate-[pulse_2s_infinite]'}`}
      >
        <MessageCircle className="w-8 h-8" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-[#1E293B] border border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-[#1E293B] p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-indigo-500 rounded-full flex items-center justify-center text-xl shadow-lg">🤖</div>
            <div>
              <h3 className="text-white font-bold">EduBot AI</h3>
              <p className="text-xs text-emerald-400 flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></span> Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto hide-scrollbar flex flex-col gap-4 bg-[#0A0F1E]/50">
          {history.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {["Which IIT is best for CSE?", "What rank do I need for NIT Trichy?", "Compare VIT and Manipal"].map(q => (
                <button key={q} onClick={() => handleSend(q)} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full hover:bg-indigo-500/30 transition-colors text-left">
                  {q}
                </button>
              ))}
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-fuchsia-600 text-white rounded-tr-sm' : 'bg-[#1E293B] border border-white/5 text-slate-200 rounded-tl-sm shadow-md'}`}>
                {msg.content.split('\n').map((line, idx) => <p key={idx} className="mb-1 last:mb-0">{line}</p>)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1E293B] border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#1E293B] border-t border-white/10">
          <form onSubmit={e => {e.preventDefault(); handleSend();}} className="flex items-center gap-2">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button type="submit" disabled={!input.trim()} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}