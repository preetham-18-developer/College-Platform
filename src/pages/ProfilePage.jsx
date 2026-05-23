import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  User, GraduationCap, Bookmark, Scale, Sparkles, MessageSquare, Settings, 
  LogOut, Edit2, CheckCircle2, Circle, ChevronRight, Trash2, MapPin, Mail, Phone, Calendar, 
  Upload, Star, Eye, EyeOff, ShieldAlert, Check, AlertCircle, Search, Activity, Lock
} from "lucide-react";
import { supabase } from "../supabaseClient";

const MOCK_COLLEGES = [
  { id: 1, name: "IIT Bombay", location: "Mumbai, Maharashtra", type: "IIT", rating: 4.9, fees: "12.5", package: "28", image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "IIT Delhi", location: "New Delhi, Delhi", type: "IIT", rating: 4.8, fees: "11.8", package: "26", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "IIT Madras", location: "Chennai, Tamil Nadu", type: "IIT", rating: 4.9, fees: "10.5", package: "27", image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "NIT Trichy", location: "Tiruchirappalli", type: "NIT", rating: 4.7, fees: "8.5", package: "18", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800" },
  { id: 5, name: "BITS Pilani", location: "Pilani, Rajasthan", type: "Private", rating: 4.8, fees: "24.5", package: "22", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800" }
];

const MOCK_USER = {
  id: 1,
  name: "Enter Name",
  displayName: "user",
  email: "loading@edurank.com",
  phone: "+91 98765 43210",
  dob: "2005-03-15",
  gender: "Male",
  city: "Hyderabad",
  state: "Telangana",
  bio: "Aspiring engineer targeting IITs. JEE 2026 aspirant. Passionate about AI/ML and competitive programming.",
  avatar: null,
  verified: true,
  memberSince: "January 2024",
  lastActive: "2 hours ago",
  profileCompletion: 72,
  stats: { saved: 8, comparisons: 3, predictions: 5, reviews: 2 },
  academic: {
    level: "Class 12",
    board: "CBSE",
    school: "Delhi Public School, Hyderabad",
    city: "Hyderabad",
    graduationYear: 2026,
    stream: "Science (PCM)",
    percentage: "94.6%",
    subjects: ["Physics", "Chemistry", "Maths", "English", "CS"],
    targetExam: "JEE Main",
    jeePercentile: "98.7",
    jeeRank: "12450",
    category: "General",
    attempts: 1,
    targetYear: "2026",
    preferredBranches: ["CSE", "AI/ML", "Data Science"],
    budgetMin: 2,
    budgetMax: 12,
    preferredStates: ["Maharashtra", "Tamil Nadu", "Karnataka", "Delhi"]
  },
  activity: [
    { id: 1, type: "saved", text: "Saved IIT Bombay to your list", time: "2 hours ago" },
    { id: 2, type: "comparison", text: "Compared NIT Trichy vs VIT Vellore", time: "5 hours ago" },
    { id: 3, type: "prediction", text: "Ran JEE Main prediction (Rank: 12450)", time: "1 day ago" },
    { id: 4, type: "review", text: "Wrote a review for NIT Warangal", time: "2 days ago" },
    { id: 5, type: "saved", text: "Saved BITS Pilani to your list", time: "3 days ago" },
    { id: 6, type: "profile", text: "Updated academic details", time: "5 days ago" }
  ]
};

const MOCK_COMPARISONS = [
  { id: 1, title: "Top NITs CS Comparison", date: "2024-05-12", colleges: [MOCK_COLLEGES[3], { id: 6, name: "NIT Warangal", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800" }], bestFee: "NIT Trichy", bestPackage: "NIT Warangal" },
  { id: 2, title: "Dream IITs", date: "2024-04-20", colleges: [MOCK_COLLEGES[0], MOCK_COLLEGES[1], MOCK_COLLEGES[2]], bestFee: "IIT Madras", bestPackage: "IIT Bombay" }
];

const MOCK_PREDICTIONS = [
  { id: 1, exam: "JEE Main", score: "Rank: 12450", date: "May 15, 2024", category: "General", state: "Telangana", results: { safe: 12, moderate: 8, ambitious: 4 } },
  { id: 2, exam: "JEE Advanced", score: "Score: 145/360", date: "April 2, 2024", category: "General", state: "Telangana", results: { safe: 0, moderate: 2, ambitious: 5 } },
  { id: 3, exam: "BITSAT", score: "Score: 285/390", date: "March 10, 2024", category: "General", state: "Telangana", results: { safe: 4, moderate: 2, ambitious: 1 } }
];

const MOCK_REVIEWS = [
  { id: 1, college: MOCK_COLLEGES[0], rating: 5, date: "April 10, 2024", tags: ["Placements", "Campus Life"], text: "Amazing campus and top-tier placements. The competitive environment really pushes you to be your best." },
  { id: 2, college: MOCK_COLLEGES[3], rating: 4, date: "March 22, 2024", tags: ["Faculty", "Hostel"], text: "Great faculty and peer group. Hostel facilities could be slightly improved but overall a great ROI." }
];

export default function ProfilePage({ navigateTo, onSignOut }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [user, setUser] = useState(MOCK_USER);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [modal, setModal] = useState({ visible: false, title: "", message: "", onConfirm: null });
  const [isEditMode, setIsEditMode] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            name: profile.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Enter Name",
            displayName: profile.display_name || session.user.email?.split('@')[0] || "user",
            email: profile.email || session.user.email,
            phone: profile.phone || "",
            city: profile.city || "",
            state: profile.state || "",
            bio: profile.bio || "",
            avatar: profile.avatar_url || null,
            profileCompletion: profile.profile_completion || 10,
            academic: {
              ...prev.academic,
              level: profile.academic_level || "Class 12",
              board: profile.board || "CBSE",
              school: profile.school || "",
              graduationYear: profile.graduation_year || 2026,
              stream: profile.stream || "Science",
              percentage: profile.percentage || "",
              targetExam: profile.target_exam || "JEE Main",
              jeePercentile: profile.jee_percentile || "",
              jeeRank: profile.jee_rank || "",
              category: profile.category || "General",
              targetYear: profile.target_year || "2026",
            }
          }));

          // If phone or bio is missing, consider it incomplete and ask for details
          if (!profile.phone && !profile.city) {
            setActiveSection("settings");
            showToast("Please complete your profile details!", "info");
          }
        } else {
          // If no profile found in DB, just use session data
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Enter Name",
            email: session.user.email,
          }));
          setActiveSection("settings");
          showToast("Please complete your profile details!", "info");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Fallback to session data if DB query totally fails
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           setUser(prev => ({
             ...prev,
             name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Enter Name",
             email: session.user.email,
           }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleEditToggle = (section) => {
    setIsEditMode(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = (section) => {
    setIsEditMode(prev => ({ ...prev, [section]: false }));
    showToast(`${section} updated successfully`);
  };

  const AnimatedCount = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 50);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 50);
      return () => clearInterval(timer);
    }, [end, duration]);
    return <span>{count}</span>;
  };

  const SidebarItem = ({ id, icon: Icon, label, badge }) => {
    const isActive = activeSection === id;
    return (
      <button 
        onClick={() => setActiveSection(id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
          isActive ? "bg-indigo-500/12 border-l-4 border-indigo-500 text-indigo-300" : "text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
          <span className="font-medium text-sm">{label}</span>
        </div>
        {badge > 0 && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-slate-300"}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  // --- SECTIONS ---

  const OverviewSection = () => (
    <div className="animate-[staggerIn_0.4s_ease-out_forwards]">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-8">
        <div className="h-[140px] w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)', backgroundSize: '200% 200%', animation: 'shimmer 8s ease infinite' }} />
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-[#060818] flex items-center justify-center relative">
                <span className="font-sora text-3xl font-bold text-white tracking-wider">AS</span>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-[#060818] animate-[pulse_2s_infinite]" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end pt-14">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sora text-2xl font-bold text-white">{user.name}</h2>
                {user.verified && <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1"><Check className="w-3 h-3"/> Verified</span>}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {user.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {user.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {user.city}, {user.state}</span>
              </div>
            </div>
            <button onClick={() => setActiveSection('settings')} className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Completion Widget */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-sora font-semibold text-white">Complete your profile</h3>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 text-lg">{user.profileCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${user.profileCompletion}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Basic Info", done: true },
                { label: "Email verified", done: true },
                { label: "Add phone number", done: true },
                { label: "Upload profile photo", done: false },
                { label: "Add academic details", done: true },
                { label: "Take first prediction", done: false }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> : <Circle className="w-4 h-4 text-indigo-400" />}
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Bookmark, val: user.stats.saved, label: "Saved Colleges", color: "indigo" },
              { icon: Scale, val: user.stats.comparisons, label: "Comparisons", color: "violet" },
              { icon: Sparkles, val: user.stats.predictions, label: "Predictions", color: "fuchsia" },
              { icon: MessageSquare, val: user.stats.reviews, label: "Reviews", color: "blue" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/20 transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-${stat.color}-500/20 text-${stat.color}-400 group-hover:bg-${stat.color}-500/30 transition-colors`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="font-sora text-3xl font-bold text-white mb-1"><AnimatedCount end={stat.val} /></div>
                <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sora font-semibold text-white">Recent Activity</h3>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all →</button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-white/10 border-l border-dashed border-white/20"></div>
            <div className="space-y-6">
              {user.activity.map((act, i) => (
                <div key={act.id} className="flex gap-4 relative animate-[staggerIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${i * 0.1}s`, opacity: 0, transform: 'translateX(20px)' }}>
                  <div className={`w-5 h-5 rounded-full z-10 flex-shrink-0 mt-0.5 border-4 border-[#0a0f1e] ${
                    act.type === 'saved' ? 'bg-indigo-500' :
                    act.type === 'comparison' ? 'bg-violet-500' :
                    act.type === 'prediction' ? 'bg-fuchsia-500' :
                    act.type === 'review' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-200 font-medium leading-tight mb-1">{act.text}</p>
                    <p className="text-[11px] text-slate-500">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AcademicSection = () => {
    const edit = isEditMode['academic'];
    
    return (
      <div className="animate-[staggerIn_0.3s_ease-out_forwards]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-sora text-2xl font-bold text-white">Academic Details</h2>
          {!edit && (
            <button onClick={() => handleEditToggle('academic')} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
              <Edit2 className="w-4 h-4" /> Edit Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Col */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10">
                <GraduationCap className="w-5 h-5 text-fuchsia-400" />
              </div>
              <h3 className="font-sora text-lg font-semibold text-white">Current Education</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                <div className="text-sm text-slate-400">Level</div>
                <div className="col-span-2 font-medium text-white">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs border border-white/10">{user.academic.level}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                <div className="text-sm text-slate-400">Board</div>
                <div className="col-span-2 font-medium text-white">{user.academic.board}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                <div className="text-sm text-slate-400">School</div>
                <div className="col-span-2 font-medium text-white">{user.academic.school}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                <div className="text-sm text-slate-400">Stream</div>
                <div className="col-span-2 font-medium text-white">{user.academic.stream}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                <div className="text-sm text-slate-400">Percentage</div>
                <div className="col-span-2 font-medium text-white">{user.academic.percentage}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-2">Subjects</div>
                <div className="flex flex-wrap gap-2">
                  {user.academic.subjects.map(sub => (
                    <span key={sub} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-slate-300">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-sora text-lg font-semibold text-white">Target Exam Profile</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-slate-400 mb-3">Primary Target</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["JEE Main", "JEE Advanced", "NEET", "BITSAT", "VITEEE"].map(ex => (
                    <div key={ex} className={`px-3 py-2 rounded-lg text-center text-sm font-medium border transition-colors cursor-default ${
                      ex === user.academic.targetExam 
                      ? "bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                      : "bg-white/5 border-white/10 text-slate-400"
                    }`}>
                      {ex}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0F1E] border border-white/10 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Target Year</div>
                  <div className="text-lg font-bold text-white">{user.academic.targetYear}</div>
                </div>
                <div className="bg-[#0A0F1E] border border-white/10 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Category</div>
                  <div className="text-lg font-bold text-white">{user.academic.category}</div>
                </div>
                <div className="bg-[#0A0F1E] border border-white/10 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Current Percentile</div>
                  <div className="text-lg font-bold text-white">{user.academic.jeePercentile}</div>
                </div>
                <div className="bg-[#0A0F1E] border border-white/10 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Current Rank</div>
                  <div className="text-lg font-bold text-white">~{user.academic.jeeRank}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Preferred Branches</div>
                <div className="flex flex-wrap gap-2">
                  {user.academic.preferredBranches.map(br => (
                    <span key={br} className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-300 font-medium">{br}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {edit && (
          <div className="mt-6 flex justify-end gap-3 animate-[fadeSlideUp_0.3s_ease-out]">
            <button onClick={() => handleEditToggle('academic')} className="px-6 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={() => handleSave('academic')} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105">Save Changes</button>
          </div>
        )}
      </div>
    );
  };

  const SavedSection = () => (
    <div className="animate-[staggerIn_0.3s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-sora text-2xl font-bold text-white flex items-center gap-3">
          Saved Colleges <span className="bg-indigo-500 text-white text-sm px-2.5 py-0.5 rounded-full">{MOCK_COLLEGES.length}</span>
        </h2>
        <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-indigo-500">
          <option value="recent">Recently Saved</option>
          <option value="rating">Highest Rating</option>
          <option value="fees">Lowest Fees</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_COLLEGES.map((c, i) => (
          <div key={c.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 relative animate-[staggerIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${i*0.1}s`, opacity: 0 }}>
            <div className="h-40 overflow-hidden relative">
              <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060818] to-transparent opacity-80" />
              <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                Saved 2d ago
              </div>
              <div className="absolute bottom-3 left-4">
                <span className="bg-indigo-500/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md mb-2 inline-block uppercase tracking-wider">{c.type}</span>
                <h3 className="font-sora text-lg font-bold text-white leading-tight">{c.name}</h3>
                <p className="text-slate-300 text-xs flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/>{c.location}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 text-sm border-b border-white/5 pb-4">
                <div className="text-center">
                  <div className="text-slate-400 text-[11px] mb-0.5">Rating</div>
                  <div className="text-white font-bold flex items-center justify-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400"/> {c.rating}</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-slate-400 text-[11px] mb-0.5">Avg Fees</div>
                  <div className="text-white font-bold">₹{c.fees}L</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-slate-400 text-[11px] mb-0.5">Highest Pkg</div>
                  <div className="text-emerald-400 font-bold">₹{c.package}L</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-colors border border-white/10">View Details</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors" onClick={() => showToast("Removed from saved", "info")}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div className="max-w-3xl animate-[fadeSlideUp_0.3s_ease-out_forwards]">
      <h2 className="font-sora text-2xl font-bold text-white mb-8">Settings</h2>
      
      {/* Profile Photo & Basic */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h3 className="font-sora text-lg font-semibold text-white mb-6">Personal Information</h3>
        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1">
            <div className="w-full h-full rounded-full bg-[#0A0F1E] flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex gap-3 mb-2">
              <button className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" /> Upload new photo
              </button>
              <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium border border-red-500/20 transition-colors">
                Remove
              </button>
            </div>
            <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input type="text" defaultValue={user.name} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
            <input type="text" defaultValue={user.displayName} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
            <textarea defaultValue={user.bio} rows="3" className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors resize-none" />
            <div className="text-right text-xs text-slate-500 mt-1">104 / 200</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h3 className="font-sora text-lg font-semibold text-white mb-6">Notifications</h3>
        <div className="space-y-4">
          {[
            "Email notifications for new college updates",
            "Admission deadline reminders",
            "Exam result alerts",
            "Weekly college recommendations"
          ].map((notif, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">{notif}</span>
              <button 
                onClick={() => showToast("Preference saved", "success")}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${i < 2 ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${i < 2 ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Danger */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <h3 className="font-sora text-lg font-semibold text-white mb-6 flex items-center gap-2"><Lock className="w-5 h-5"/> Security</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
           <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
          </div>
        </div>
        <div className="flex justify-end mb-8 border-b border-white/10 pb-8">
          <button onClick={() => showToast("Password updated")} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105">Update Password</button>
        </div>

        <div className="pt-2">
          <h3 className="font-sora text-lg font-semibold text-red-400 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Danger Zone</h3>
          <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button onClick={() => setModal({
            visible: true,
            title: "Are you sure?",
            message: "This action cannot be undone. All your saved colleges, predictions, and reviews will be permanently deleted.",
            onConfirm: () => { setModal({visible: false}); onSignOut && onSignOut(); }
          })} className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2.5 rounded-xl font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const ComparisonsSection = () => (
    <div className="animate-[staggerIn_0.3s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-sora text-2xl font-bold text-white flex items-center gap-3">
          Saved Comparisons <span className="bg-violet-500 text-white text-sm px-2.5 py-0.5 rounded-full">{MOCK_COMPARISONS.length}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_COMPARISONS.map((comp, idx) => (
          <div key={comp.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-violet-500/50 transition-all duration-300 relative group animate-[staggerIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${idx*0.1}s`, opacity: 0 }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-sora text-lg font-bold text-white">{comp.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Saved on {comp.date}</p>
              </div>
              <button className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => showToast("Comparison deleted", "info")}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-6 bg-[#0A0F1E] p-3 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
              {comp.colleges.map((c, i) => (
                <React.Fragment key={c.id}>
                  <div className="flex flex-col items-center flex-shrink-0 w-20">
                    <img src={c.image} className="w-10 h-10 rounded-full object-cover border-2 border-white/10 mb-2" alt={c.name} />
                    <span className="text-[10px] text-center text-slate-300 font-medium leading-tight">{c.name}</span>
                  </div>
                  {i < comp.colleges.length - 1 && (
                    <div className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-full shrink-0">VS</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <div className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider mb-1">Best ROI (Fees)</div>
                <div className="text-sm font-semibold text-emerald-400 truncate">{comp.bestFee}</div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <div className="text-[10px] text-indigo-400/80 uppercase font-bold tracking-wider mb-1">Highest Package</div>
                <div className="text-sm font-semibold text-indigo-400 truncate">{comp.bestPackage}</div>
              </div>
            </div>

            <button className="w-full bg-white/5 hover:bg-white/10 text-white text-sm font-semibold py-3 rounded-xl transition-colors border border-white/10 flex justify-center items-center gap-2">
              View Full Comparison <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const PredictionsSection = () => (
    <div className="animate-[staggerIn_0.3s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-sora text-2xl font-bold text-white flex items-center gap-3">
          Prediction History <span className="bg-fuchsia-500 text-white text-sm px-2.5 py-0.5 rounded-full">{MOCK_PREDICTIONS.length}</span>
        </h2>
      </div>

      <div className="space-y-4 mb-8">
        {MOCK_PREDICTIONS.map((pred, idx) => (
          <div key={pred.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 animate-[staggerIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${idx*0.1}s`, opacity: 0 }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-sora text-lg font-bold text-white">{pred.exam}</h3>
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold px-2.5 py-1 rounded-full border border-fuchsia-500/20">{pred.score}</span>
              </div>
              <div className="flex gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {pred.date}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {pred.category}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {pred.state}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0A0F1E] p-2 rounded-xl border border-white/5 self-start md:self-auto">
              <div className="px-3 py-1.5 flex flex-col items-center">
                <span className="text-emerald-400 font-bold text-lg leading-none">{pred.results.safe}</span>
                <span className="text-[10px] text-emerald-400/70 font-medium uppercase mt-1">Safe</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="px-3 py-1.5 flex flex-col items-center">
                <span className="text-amber-400 font-bold text-lg leading-none">{pred.results.moderate}</span>
                <span className="text-[10px] text-amber-400/70 font-medium uppercase mt-1">Moderate</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="px-3 py-1.5 flex flex-col items-center">
                <span className="text-red-400 font-bold text-lg leading-none">{pred.results.ambitious}</span>
                <span className="text-[10px] text-red-400/70 font-medium uppercase mt-1">Ambitious</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors border border-white/10 whitespace-nowrap">View Results</button>
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 shrink-0">
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto">
        Run New Prediction <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const ReviewsSection = () => (
    <div className="animate-[staggerIn_0.3s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-sora text-2xl font-bold text-white flex items-center gap-3">
          My Reviews <span className="bg-blue-500 text-white text-sm px-2.5 py-0.5 rounded-full">{MOCK_REVIEWS.length}</span>
        </h2>
      </div>

      <div className="space-y-6">
        {MOCK_REVIEWS.map((rev, idx) => (
          <div key={rev.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative animate-[staggerIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${idx*0.1}s`, opacity: 0 }}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="flex items-start gap-5">
              <img src={rev.college.image} alt={rev.college.name} className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg" />
              <div className="flex-1">
                <h3 className="font-sora text-lg font-bold text-white leading-tight mb-1">{rev.college.name}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-600'}`} />)}
                  </div>
                  <span className="text-xs text-slate-500">{rev.date}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{rev.text}"</p>
                <div className="flex flex-wrap gap-2">
                  {rev.tags.map(tag => (
                    <span key={tag} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#060818] font-[Inter] flex relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap');
        
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, -50px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .bg-grid-dots {
          background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}} />

      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="bg-grid-dots absolute inset-0 opacity-[0.025]" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#D946EF] opacity-[0.12] blur-[100px] animate-[orbFloat_16s_infinite_alternate_ease-in-out]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-[#6366F1] opacity-[0.12] blur-[100px] animate-[orbFloat_14s_infinite_alternate-reverse_ease-in-out]" />
        <div className="absolute top-[30%] -right-[5%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6] opacity-[0.12] blur-[100px] animate-[orbFloat_12s_infinite_alternate_ease-in-out]" />
      </div>

      {/* TOAST */}
      {toast.visible && (
        <div className="fixed top-24 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-[fadeSlideUp_0.3s_ease-out]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `4px solid ${toast.type === 'error' ? '#F43F5E' : '#10B981'}` }}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-[#F43F5E]" /> : <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
          <span className="font-medium text-white">{toast.message}</span>
        </div>
      )}

      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeSlideUp_0.2s_ease-out]">
          <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <h3 className="font-sora text-xl font-bold text-red-400 mb-2">{modal.title}</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal({visible: false})} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={modal.onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex flex-col w-[260px] flex-shrink-0 bg-white/5 backdrop-blur-xl border-r border-white/10 relative z-20 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide py-6 px-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-0.5">
            <div className="w-full h-full rounded-full bg-[#060818] flex items-center justify-center font-bold text-white">AS</div>
          </div>
          <div className="overflow-hidden">
            <h3 className="font-sora font-bold text-white truncate">{user.name}</h3>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <SidebarItem id="overview" icon={User} label="Profile Overview" />
          <SidebarItem id="academic" icon={GraduationCap} label="Academic Details" />
          <SidebarItem id="saved" icon={Bookmark} label="Saved Colleges" badge={user.stats.saved} />
          <SidebarItem id="comparisons" icon={Scale} label="My Comparisons" badge={user.stats.comparisons} />
          <SidebarItem id="predictions" icon={Sparkles} label="My Predictions" />
          <SidebarItem id="reviews" icon={MessageSquare} label="My Reviews" />
          <SidebarItem id="settings" icon={Settings} label="Settings" />
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 px-2">
          <button onClick={() => onSignOut && onSignOut()} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "academic" && <AcademicSection />}
          {activeSection === "saved" && <SavedSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "comparisons" && <ComparisonsSection />}
          {activeSection === "predictions" && <PredictionsSection />}
          {activeSection === "reviews" && <ReviewsSection />}
        </div>
      </div>

      {/* BOTTOM TAB BAR (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0F1E]/95 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-3 flex justify-between items-center">
        {[
          { id: "overview", icon: User },
          { id: "academic", icon: GraduationCap },
          { id: "saved", icon: Bookmark },
          { id: "settings", icon: Settings }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)} className={`p-2.5 rounded-xl transition-all ${activeSection === tab.id ? 'bg-indigo-500/20 text-indigo-400 scale-110' : 'text-slate-500'}`}>
            <tab.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
