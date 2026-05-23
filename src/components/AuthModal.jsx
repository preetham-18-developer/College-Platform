import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Balloons } from './ui/balloons';

// Simple client-side rate limiting utility
const RateLimiter = {
  getAttempts: (email) => {
    const data = JSON.parse(localStorage.getItem(`auth_attempts_${email}`) || '{"count": 0, "lockUntil": null}');
    return data;
  },
  recordAttempt: (email) => {
    const data = RateLimiter.getAttempts(email);
    data.count += 1;
    if (data.count >= 5) {
      // Lock for 60 seconds after 5 failed attempts
      data.lockUntil = new Date(Date.now() + 60 * 1000).toISOString();
    }
    localStorage.setItem(`auth_attempts_${email}`, JSON.stringify(data));
    return data;
  },
  resetAttempts: (email) => {
    localStorage.removeItem(`auth_attempts_${email}`);
  },
  isLocked: (email) => {
    const data = RateLimiter.getAttempts(email);
    if (!data.lockUntil) return false;
    if (new Date() > new Date(data.lockUntil)) {
      RateLimiter.resetAttempts(email);
      return false;
    }
    return true;
  },
  getTimeLeft: (email) => {
    const data = RateLimiter.getAttempts(email);
    if (!data.lockUntil) return 0;
    const left = Math.ceil((new Date(data.lockUntil) - new Date()) / 1000);
    return left > 0 ? left : 0;
  }
};

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const balloonsRef = useRef(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [timeLeft, setTimeLeft] = useState(0);

  // Update lockout timer
  useEffect(() => {
    if (!isOpen) return;
    
    let interval;
    if (RateLimiter.isLocked(formData.email)) {
      setTimeLeft(RateLimiter.getTimeLeft(formData.email));
      interval = setInterval(() => {
        const left = RateLimiter.getTimeLeft(formData.email);
        if (left <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
        } else {
          setTimeLeft(left);
        }
      }, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => clearInterval(interval);
  }, [formData.email, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Rate Limiting Check
    if (RateLimiter.isLocked(formData.email)) {
      setError(`Too many failed attempts. Please try again in ${RateLimiter.getTimeLeft(formData.email)} seconds.`);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN logic
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          RateLimiter.recordAttempt(formData.email);
          throw error;
        }

        RateLimiter.resetAttempts(formData.email);
        setSuccess("Login successful!");
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update user state across app
        }, 1000);

      } else {
        // SIGNUP logic
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const passError = validatePassword(formData.password);
        if (passError) throw new Error(passError);

        if (!formData.phone.match(/^[0-9]{10}$/)) {
          throw new Error("Please enter a valid 10-digit phone number.");
        }

        if (!formData.name.trim()) {
          throw new Error("Name is required.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              phone: formData.phone
            }
          }
        });

        if (error) throw error;

        setSuccess("Registration successful! Please check your email to verify your account.");
        
        // Trigger balloons animation
        if (balloonsRef.current) {
          balloonsRef.current.launchAnimation();
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden animate-fade-in">
            <div className="modal-header border-0 bg-light pb-0 position-relative">
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={onClose}
              ></button>
              <div className="w-100 mt-2">
                <ul className="nav nav-tabs nav-fill border-0 premium-tabs">
                  <li className="nav-item">
                    <button 
                      className={`nav-link fw-bold fs-5 ${isLogin ? 'active border-primary text-primary border-bottom border-3' : 'text-muted'}`}
                      onClick={() => toggleMode()}
                    >
                      Login
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link fw-bold fs-5 ${!isLogin ? 'active border-primary text-primary border-bottom border-3' : 'text-muted'}`}
                      onClick={() => toggleMode()}
                    >
                      Sign Up
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="modal-body p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-1">{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
                <p className="text-muted small">
                  {isLogin 
                    ? 'Enter your credentials to access your account' 
                    : 'Join thousands of students making smarter college decisions'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small border-0 shadow-sm rounded-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 small border-0 shadow-sm rounded-3">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleAuth}>
                {!isLogin && (
                  <>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Full Name</label>
                      <div className="position-relative">
                        <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        <input 
                          type="text" 
                          name="name"
                          className="form-control premium-input ps-5" 
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Phone Number</label>
                      <div className="position-relative">
                        <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        <input 
                          type="tel" 
                          name="phone"
                          className="form-control premium-input ps-5" 
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Email Address</label>
                  <div className="position-relative">
                    <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input 
                      type="email" 
                      name="email"
                      className="form-control premium-input ps-5" 
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-muted">Password</label>
                    {isLogin && <a href="#" className="small text-primary text-decoration-none fw-medium">Forgot?</a>}
                  </div>
                  <div className="position-relative">
                    <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input 
                      type="password" 
                      name="password"
                      className="form-control premium-input ps-5" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                    <div className="position-relative">
                      <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                      <input 
                        type="password" 
                        name="confirmPassword"
                        className="form-control premium-input ps-5" 
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-premium w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading || timeLeft > 0}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : null}
                  {timeLeft > 0 
                    ? `Try again in ${timeLeft}s` 
                    : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="small text-muted mb-0">
                  By continuing, you agree to our <a href="#" className="text-primary text-decoration-none">Terms of Service</a> and <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Balloons ref={balloonsRef} type="default" />
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AuthModal;
