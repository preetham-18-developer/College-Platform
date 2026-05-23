import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bookmark, LayoutGrid, Search, Menu, X, ArrowRightLeft, Sparkles, MessageSquare, LogOut, User } from 'lucide-react'
import AuthModal from './AuthModal'
import { supabase } from '../services/supabase'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <nav className={`navbar navbar-expand-lg sticky-top transition-all ${isScrolled ? 'glass-effect py-2' : 'bg-white py-3 border-bottom'}`} style={{ zIndex: 1000, transition: 'all 0.3s ease' }}>
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center">
              <LayoutGrid size={20} />
            </div>
            <span className="fs-4 tracking-tight" style={{ color: 'var(--dark-color)' }}>EduDiscover</span>
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" onClick={toggleMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-1 gap-lg-3 align-items-lg-center">
              <li className="nav-item">
                <Link to="/predictor" className={`nav-link fw-medium px-3 rounded-pill ${location.pathname === '/predictor' ? 'text-primary bg-light' : 'text-dark hover-bg-light'}`}>
                  <Sparkles size={18} className="me-1 mb-1 d-inline-block" /> Predictor
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/discussions" className={`nav-link fw-medium px-3 rounded-pill ${location.pathname === '/discussions' ? 'text-primary bg-light' : 'text-dark hover-bg-light'}`}>
                  <MessageSquare size={18} className="me-1 mb-1 d-inline-block" /> Q&A
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/compare" className={`nav-link fw-medium px-3 rounded-pill ${location.pathname === '/compare' ? 'text-primary bg-light' : 'text-dark hover-bg-light'}`}>
                  <ArrowRightLeft size={18} className="me-1 mb-1 d-inline-block" /> Compare
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/saved" className={`nav-link fw-medium px-3 rounded-pill ${location.pathname === '/saved' ? 'text-primary bg-light' : 'text-dark hover-bg-light'}`}>
                  <Bookmark size={18} className="me-1 mb-1 d-inline-block" /> Saved
                </Link>
              </li>
              
              {user ? (
                <li className="nav-item ms-lg-2 mt-3 mt-lg-0 d-flex gap-2">
                  <div className="d-flex align-items-center px-3 py-2 bg-light rounded-pill border fw-medium small">
                    <User size={16} className="me-2 text-primary" />
                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                  </div>
                  <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill d-flex align-items-center justify-content-center" title="Log Out" style={{ width: '40px', height: '40px' }}>
                    <LogOut size={16} />
                  </button>
                </li>
              ) : (
                <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
                  <button onClick={() => setIsAuthOpen(true)} className="btn btn-premium w-100 rounded-pill px-4">Sign In</button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}

export default Navbar