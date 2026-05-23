import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { Sparkles, Target, Award, Search, ArrowRight } from 'lucide-react'
import colleges from '../data/colleges'
import CollegeCard from '../components/CollegeCard'

const Predictor = () => {
  const [formData, setFormData] = useState({
    examType: 'EAMCET',
    rank: '',
    category: 'General'
  })
  
  const [predicted, setPredicted] = useState(null)
  
  const handlePredict = (e) => {
    e.preventDefault()
    if (!formData.rank) return
    
    // Simple mock prediction logic
    const rank = parseInt(formData.rank)
    let matched = []
    
    if (rank < 5000) {
      matched = colleges.filter(c => c.rating >= 4.3)
    } else if (rank < 20000) {
      matched = colleges.filter(c => c.rating >= 4.1 && c.rating < 4.4)
    } else {
      matched = colleges.filter(c => c.rating < 4.2)
    }
    
    // Sort and take top 6
    matched = matched.sort((a, b) => b.rating - a.rating).slice(0, 6)
    
    setPredicted(matched)
  }

  return (
    <div className="bg-light-subtle min-vh-100 pb-5">
      <Navbar />
      
      <div className="hero-gradient border-bottom py-5">
        <div className="container text-center py-4 animate-fade-in">
          <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-4" style={{ width: '64px', height: '64px' }}>
            <Sparkles size={32} className="text-primary" />
          </div>
          <h1 className="display-5 fw-bold mb-3 tracking-tight">College Predictor</h1>
          <p className="lead text-muted max-w-2xl mx-auto" style={{ maxWidth: '600px' }}>
            Enter your rank and category to predict your admission chances at top engineering colleges.
          </p>
        </div>
      </div>

      <div className="container mt-n5 position-relative z-2">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="premium-card p-4 p-md-5">
              <form onSubmit={handlePredict}>
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark mb-2 d-flex align-items-center gap-2">
                      <Target size={16} className="text-primary" /> Exam Type
                    </label>
                    <select 
                      className="form-select premium-input"
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                    >
                      <option value="EAMCET">AP EAMCET</option>
                      <option value="JEE">JEE Mains</option>
                    </select>
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark mb-2 d-flex align-items-center gap-2">
                      <Award size={16} className="text-warning" /> Rank / Percentile
                    </label>
                    <input 
                      type="number" 
                      className="form-control premium-input"
                      placeholder="e.g. 15000"
                      value={formData.rank}
                      onChange={(e) => setFormData({...formData, rank: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark mb-2 d-flex align-items-center gap-2">
                      <Search size={16} className="text-success" /> Category
                    </label>
                    <select 
                      className="form-select premium-input"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="General">General (OC)</option>
                      <option value="OBC">BC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  
                  <div className="col-12 mt-4 text-center">
                    <button type="submit" className="btn btn-premium btn-lg rounded-pill px-5 d-inline-flex align-items-center gap-2">
                      Predict Colleges <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {predicted && (
          <div className="animate-fade-in mt-5 pt-4 border-top">
            <div className="text-center mb-5">
              <h2 className="fw-bold">Your Predicted Colleges</h2>
              <p className="text-muted">Based on your {formData.examType} rank of {formData.rank} in {formData.category} category</p>
            </div>
            
            <div className="row g-4">
              {predicted.length > 0 ? (
                predicted.map(college => (
                  <CollegeCard key={college.id} college={college} />
                ))
              ) : (
                <div className="col-12 text-center">
                  <p className="lead text-muted">No matching colleges found. Try adjusting your rank.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Predictor
