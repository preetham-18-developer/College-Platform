import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Lock, ShieldCheck, Check, Eye, EyeOff, AlertCircle, Sparkles, X, Info, GraduationCap } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function AuthPage({ onLoginSuccess, navigateTo, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  
  const [formData, setFormData] = useState({ 
    name: "", email: "", phone: "", password: "", confirmPassword: "", terms: false, rememberMe: false 
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [shake, setShake] = useState(false);

  // If user is already logged in, redirect them to profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && navigateTo) {
        navigateTo('profile');
      }
    });
  }, [navigateTo]);

  // Floating label active states
  const [focused, setFocused] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const validateField = (field, value) => {
    let error = "";
    if (field === "name" && !isLogin) {
      if (!value) error = "Full name is required";
      else if (value.length < 2) error = "Name must be at least 2 characters";
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = "Name can only contain letters";
    }
    if (field === "email") {
      if (!value) error = "Email address is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address";
    }
    if (field === "phone" && !isLogin) {
      if (value && value.length !== 10) error = "Enter valid 10-digit number";
      else if (value && !/^\d+$/.test(value)) error = "Phone can only contain numbers";
    }
    if (field === "password") {
      if (!value) error = "Password is required";
      else if (!isLogin && value.length < 6) error = "Password must be at least 6 characters";
    }
    if (field === "confirmPassword" && !isLogin) {
      if (!value) error = "Please confirm your password";
      else if (value !== formData.password) error = "Passwords do not match";
    }
    if (field === "terms" && !isLogin) {
      if (!value) error = "You must accept the terms to continue";
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocused(prev => ({ ...prev, [field]: false }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFocus = (field) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (touched[field]) {
        setErrors(errs => ({ ...errs, [field]: validateField(field, value) }));
      }
      if (field === "password" && touched.confirmPassword) {
         setErrors(errs => ({ ...errs, confirmPassword: validateField("confirmPassword", newData.confirmPassword) }));
      }
      return newData;
    });
  };

  const calculateStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s += 1;
    if (pw.length >= 8) s += 1;
    if (/[A-Z]/.test(pw)) s += 1;
    if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
    return s;
  };

  const strength = calculateStrength(formData.password);
  const strengthLabels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#334155", "#F43F5E", "#F59E0B", "#EAB308", "#10B981"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all
    const newErrors = {};
    const fieldsToValidate = isLogin ? ["email", "password"] : ["name", "email", "phone", "password", "confirmPassword", "terms"];
    
    let hasError = false;
    fieldsToValidate.forEach(f => {
      const err = validateField(f, formData[f]);
      if (err) {
        newErrors[f] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);
    
    const allTouched = {};
    fieldsToValidate.forEach(f => allTouched[f] = true);
    setTouched(allTouched);

    if (hasError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    
    try {
      let authError = null;
      let sessionData = null;

      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        authError = error;
        sessionData = data;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              phone: formData.phone
            }
          }
        });
        authError = error;
        sessionData = data;
      }

      setIsLoading(false);

      if (authError) {
        setErrors(prev => ({ ...prev, email: authError.message }));
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      setIsSuccess(true);
      
      // If session is null after signup, email confirmation is required!
      if (!isLogin && sessionData?.user && !sessionData?.session) {
        showToast("Account created! Please check your email to verify.", "info");
        setTimeout(() => {
          setIsSuccess(false);
          setIsLogin(true); // Switch to login mode
        }, 2000);
        return;
      }

      showToast(isLogin ? "Welcome back! Redirecting..." : "Account created! Welcome to EduRank 🎉", "success");
      
      setTimeout(() => {
        setIsSuccess(false);
        if (navigateTo) navigateTo('profile');
      }, 1000);
      
    } catch (err) {
      showToast(err.message || "An unexpected error occurred", "error");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + "/?view=profile"
        }
      });
      if (error) throw error;
    } catch (err) {
      showToast(err.message || "An unexpected error occurred", "error");
      setIsLoading(false);
    }
  };

  const renderInputField = ({ name, type, label, icon: Icon, placeholder, isOptional }) => {
    const isFocused = focused[name];
    const hasValue = String(formData[name]).length > 0;
    const isFloating = isFocused || hasValue;
    const error = touched[name] && errors[name];
    const isValid = touched[name] && !error && hasValue;

    let inputType = type;
    if (name === "password") inputType = passwordVisible ? "text" : "password";
    if (name === "confirmPassword") inputType = confirmVisible ? "text" : "password";

    let baseColor = "#64748B";
    let borderColor = "rgba(255,255,255,0.08)";
    let shadow = "none";
    let bg = "rgba(255,255,255,0.04)";

    if (isFocused) {
      baseColor = "#6366F1";
      borderColor = "#6366F1";
      bg = "rgba(99,102,241,0.06)";
      shadow = "0 0 0 3px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.1)";
    }
    if (error) {
      borderColor = "#F43F5E";
      shadow = isFocused ? "0 0 0 3px rgba(244,63,94,0.15)" : "none";
    } else if (isValid) {
      borderColor = "#10B981";
      shadow = isFocused ? "0 0 0 3px rgba(16,185,129,0.1)" : "none";
    }

    return (
      <div className="relative mb-6">
        <label className="block absolute pointer-events-none transition-all duration-200 z-10"
          style={{
            left: "44px",
            top: "14px",
            fontSize: isFloating ? "13px" : "15px",
            color: isFloating ? (error ? "#F43F5E" : baseColor) : "#94A3B8",
            transform: isFloating ? "translate(-32px, -36px)" : "translate(0, 0)",
            fontWeight: 500
          }}
        >
          {label} {isOptional && <span className="text-slate-500 font-normal">(Optional)</span>}
        </label>
        
        <div className="relative flex items-center">
          <Icon className="absolute left-4 transition-colors duration-200 z-10 w-4 h-4" style={{ color: error ? "#F43F5E" : baseColor }} />
          
          {name === "phone" && (
            <div className="absolute left-[44px] flex items-center h-full text-white/80 border-r border-white/10 pr-2 mr-2 text-sm">
              +91
            </div>
          )}

          <input
            type={inputType}
            placeholder={isFocused ? placeholder : ""}
            value={formData[name]}
            onChange={(e) => handleChange(name, e.target.value)}
            onFocus={() => handleFocus(name)}
            onBlur={() => handleBlur(name)}
            className="w-full text-[#F8FAFC] text-[15px] font-[Inter] rounded-xl outline-none transition-all duration-200"
            style={{
              background: bg,
              border: `1px solid ${borderColor}`,
              boxShadow: shadow,
              padding: name === "phone" ? "14px 16px 14px 88px" : "14px 16px 14px 44px"
            }}
          />
          
          {isValid && name !== "password" && name !== "confirmPassword" && (
            <Check className="absolute right-4 w-4 h-4 text-[#10B981] animate-[scaleIn_0.2s_ease-out]" />
          )}

          {(name === "password" || name === "confirmPassword") && (
            <button type="button" 
              onClick={() => name === "password" ? setPasswordVisible(!passwordVisible) : setConfirmVisible(!confirmVisible)}
              className="absolute right-4 text-slate-400 hover:text-white transition-colors"
            >
              {name === "password" ? (
                passwordVisible ? <EyeOff className="w-4 h-4 animate-[rotateIn_0.2s]" /> : <Eye className="w-4 h-4 animate-[rotateIn_0.2s]" />
              ) : (
                confirmVisible ? <EyeOff className="w-4 h-4 animate-[rotateIn_0.2s]" /> : <Eye className="w-4 h-4 animate-[rotateIn_0.2s]" />
              )}
            </button>
          )}
        </div>

        {/* Password Strength Meter */}
        {name === "password" && !isLogin && hasValue && (
          <div className="mt-2 animate-[fadeSlideDown_0.2s_ease-out]">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: strength >= i ? strengthColors[strength] : "#334155" }}
                />
              ))}
            </div>
            <p className="text-xs text-right font-medium" style={{ color: strengthColors[strength] }}>
              {strengthLabels[strength]}
            </p>
          </div>
        )}

        {error && (
          <div className="text-[#F43F5E] text-xs mt-1.5 flex items-center gap-1 animate-[fadeSlideDown_0.2s_ease-out]">
            <AlertCircle className="w-3 h-3" /> {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-[#060818] font-[Inter] overflow-hidden flex z-[200]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(50px, -50px); }
          50% { transform: translate(100px, 0); }
          75% { transform: translate(50px, 50px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes staggerFadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes rotateIn {
          from { transform: rotate(-180deg); opacity: 0; }
          to { transform: rotate(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .bg-grid {
          background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0D1117 inset !important;
            -webkit-text-fill-color: #F8FAFC !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* BACKGROUND ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-grid absolute inset-0 opacity-[0.03]"></div>
        <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full bg-[#D946EF] opacity-[0.15] blur-[80px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#6366F1] opacity-[0.15] blur-[80px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#8B5CF6] opacity-[0.15] blur-[80px] animate-[float_12s_ease-in-out_infinite]" />
      </div>

      {/* TOAST */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-[slideInRight_0.3s_ease-out]"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            borderLeft: `4px solid ${toast.type === 'error' ? '#F43F5E' : toast.type === 'info' ? '#6366F1' : '#10B981'}`
          }}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-[#F43F5E]" /> : 
           toast.type === 'info' ? <Info className="w-5 h-5 text-[#6366F1]" /> : 
           <Check className="w-5 h-5 text-[#10B981]" />}
          <span className="font-medium text-white">{toast.message}</span>
        </div>
      )}

      {/* LEFT PANEL - Desktop Only */}
      <div className="hidden md:block w-1/2 relative z-10 border-r border-white/5 overflow-y-auto scrollbar-hide h-screen">
        <div className="min-h-full w-full flex flex-col justify-between p-12">
        <div>
          <div className="flex items-center cursor-pointer mb-16" onClick={() => navigateTo && navigateTo('home')}>
            <GraduationCap className="h-10 w-10 text-[#D946EF] mr-2" />
            <span className="font-sora font-bold text-3xl tracking-tight" style={{ background: 'linear-gradient(to right, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              EduRank<Sparkles className="inline-block w-5 h-5 ml-1 text-[#8B5CF6]" />
            </span>
          </div>
          
          <h1 className="text-[48px] font-sora font-bold text-[#F8FAFC] leading-[1.1] mb-6">
            Your dream college journey starts here.
          </h1>
          <p className="text-[#94A3B8] text-[16px] max-w-md leading-relaxed mb-12">
            Join 2M+ students discovering the perfect college, predicting admissions, and making confident decisions.
          </p>

          <div className="space-y-5">
            {["Search 600+ colleges instantly", "AI-powered admission predictor", "Side-by-side college comparison", "Personalized college recommendations"].map((feat, i) => (
              <div key={i} className="flex items-center text-white/90 animate-[staggerFadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${(i+1)*0.1}s`, opacity: 0 }}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#D946EF] flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-48 mt-12">
          {/* Floating Cards */}
          <div className="absolute top-0 left-0 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-xl animate-[floatCard_4s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}>
            <span className="text-white font-medium text-sm">🎓 IIT Bombay — Avg ₹28 LPA</span>
          </div>
          <div className="absolute top-16 left-24 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-xl animate-[floatCard_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
            <span className="text-white font-medium text-sm">📈 94% Placement Rate</span>
          </div>
          <div className="absolute top-8 left-64 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-xl animate-[floatCard_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
            <span className="text-white font-medium text-sm">⭐ 4.9 Student Rating</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-8 border-t border-white/10">
          <div className="flex -space-x-3">
            {['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'].map((c,i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#060818] flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: c }}>
                {String.fromCharCode(65+i)}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-[#94A3B8]">Trusted by 2M+ students</span>
        </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full md:w-1/2 relative z-10 overflow-y-auto scrollbar-hide h-screen">
        <div className="min-h-full flex flex-col items-center justify-center p-4 py-12">
        {/* Mobile Header (only shows on mobile) */}
        <div className="md:hidden absolute top-6 left-6 flex items-center cursor-pointer" onClick={() => navigateTo && navigateTo('home')}>
           <GraduationCap className="h-8 w-8 text-[#D946EF] mr-2" />
           <span className="font-sora font-bold text-xl" style={{ background: 'linear-gradient(to right, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', color: 'transparent' }}>EduRank</span>
        </div>

        <div className={`w-full max-w-[440px] p-8 md:p-10 rounded-[24px] relative transition-all duration-300 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}>
          
          {/* Close button if replacing modal completely */}
          {navigateTo && (
            <button onClick={() => navigateTo('home')} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="mb-8 relative z-10 transition-all duration-300">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-indigo-300 mb-4 shadow-inner">
              {isLogin ? "🔐 Welcome back" : "🚀 Get started free"}
            </div>
            <h2 className="font-sora font-bold text-[28px] text-white mb-2 leading-tight">
              {isLogin ? "Sign in to EduRank" : "Create your account"}
            </h2>
            <p className="text-[#94A3B8] text-[14px]">
              {isLogin ? "Access your saved colleges and predictions" : "Join 2M+ students on their college journey"}
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <button type="button" onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <span className="text-[#94A3B8] text-xs font-medium">or continue with email</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 transition-all duration-300">
            <div className={`transition-all duration-500 overflow-hidden ${isLogin ? 'max-h-0 opacity-0' : 'max-h-[120px] opacity-100'}`}>
               {!isLogin && renderInputField({ name: "name", type: "text", label: "Full Name", icon: User, placeholder: "John Doe" })}
            </div>

            {renderInputField({ name: "email", type: "email", label: "Email Address", icon: Mail, placeholder: "you@example.com" })}
            
            <div className={`transition-all duration-500 overflow-hidden ${isLogin ? 'max-h-0 opacity-0' : 'max-h-[120px] opacity-100'}`}>
              {!isLogin && renderInputField({ name: "phone", type: "tel", label: "Phone Number", icon: Phone, placeholder: "98765 43210", isOptional: true })}
            </div>

            <div className="relative">
              {isLogin && (
                <div className="absolute right-0 -top-6 text-[13px] font-medium cursor-pointer animate-[fadeIn_0.3s]" style={{ background: 'linear-gradient(to right, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', color: 'transparent' }} onClick={() => showToast("Password reset email sent!", "success")}>
                  Forgot password?
                </div>
              )}
              {renderInputField({ name: "password", type: "password", label: "Password", icon: Lock, placeholder: isLogin ? "••••••••" : "Create a strong password" })}
            </div>

            <div className={`transition-all duration-500 overflow-hidden ${isLogin ? 'max-h-0 opacity-0' : 'max-h-[120px] opacity-100'}`}>
              {!isLogin && renderInputField({ name: "confirmPassword", type: "password", label: "Confirm Password", icon: ShieldCheck, placeholder: "Repeat your password" })}
            </div>

            {/* Checkboxes */}
            {!isLogin ? (
              <label className="flex items-start gap-3 mt-4 mb-6 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="sr-only" checked={formData.terms} onChange={(e) => {
                    setFormData(prev => ({...prev, terms: e.target.checked}));
                    if(touched.terms) setErrors(errs => ({...errs, terms: e.target.checked ? "" : "You must accept the terms to continue"}));
                  }} />
                  <div className={`w-[18px] h-[18px] rounded transition-all duration-200 flex items-center justify-center ${formData.terms ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] border-none scale-110' : 'bg-white/5 border border-white/15 group-hover:border-[#6366F1]'}`}>
                    {formData.terms && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[#94A3B8] text-[13px] leading-tight block">
                    I agree to the <span className="text-[#6366F1] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#6366F1] hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                  {touched.terms && errors.terms && <span className="text-[#F43F5E] text-xs mt-1 block">{errors.terms}</span>}
                </div>
              </label>
            ) : (
              <label className="flex items-center gap-3 mt-4 mb-6 cursor-pointer group animate-[fadeIn_0.3s]">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={formData.rememberMe} onChange={(e) => setFormData(prev => ({...prev, rememberMe: e.target.checked}))} />
                  <div className={`w-[18px] h-[18px] rounded transition-all duration-200 flex items-center justify-center ${formData.rememberMe ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] border-none scale-110' : 'bg-white/5 border border-white/15 group-hover:border-[#6366F1]'}`}>
                    {formData.rememberMe && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-[#94A3B8] text-[13px] font-medium">Remember me for 30 days</span>
              </label>
            )}

            <button type="submit" disabled={isLoading || isSuccess} className="w-full relative py-4 rounded-xl text-white font-sora font-semibold text-[16px] transition-all duration-300 overflow-hidden mt-2 border-none"
              style={{
                background: isSuccess ? '#10B981' : 'linear-gradient(135deg, #6366F1, #8B5CF6, #D946EF)',
                backgroundSize: '200% 200%',
                boxShadow: isSuccess ? '0 8px 24px rgba(16,185,129,0.35)' : '0 8px 24px rgba(99,102,241,0.35)',
                animation: isSuccess ? 'none' : 'gradientShift 3s infinite',
                transform: isLoading ? 'scale(0.99)' : 'translateY(0)',
                opacity: isLoading ? 0.8 : 1,
                cursor: (isLoading || isSuccess) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if(!isLoading && !isSuccess) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isLoading && !isSuccess) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)';
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-[spin_0.8s_linear_infinite]" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5 animate-[scaleIn_0.3s_ease-out]" />
                    Success!
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 transition-all duration-300">
            <button type="button" onClick={() => {
              setIsLogin(!isLogin);
              setErrors({}); setTouched({});
            }} className="text-[14px] font-medium" style={{ background: 'linear-gradient(to right, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              {isLogin ? "New here? Create account →" : "Already have an account? Sign in →"}
            </button>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
