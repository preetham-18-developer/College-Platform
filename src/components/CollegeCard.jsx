import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, IndianRupee, ArrowRightLeft, Bookmark, GraduationCap, Briefcase } from 'lucide-react'

const CollegeCard = ({ college }) => {
  const [isSaved, setIsSaved] = useState(false)

  const handleCompare = (e, college) => {
    e.preventDefault();
    e.stopPropagation();

    const existingColleges = JSON.parse(localStorage.getItem('compareColleges')) || []

    const alreadyExists = existingColleges.find((item) => item.id === college.id)

    if (alreadyExists) {
      alert('College already added for comparison')
      return
    }

    if (existingColleges.length >= 3) {
      alert('You can compare only 3 colleges')
      return
    }

    existingColleges.push(college)
    localStorage.setItem('compareColleges', JSON.stringify(existingColleges))
    alert('College added to compare')
  }

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    // In a real app, this would save to localStorage or backend
  }

  return (
    <div className="col-md-6 col-xl-4">
      <Link to={`/college/${college.id}`} state={{ college }} className="text-decoration-none text-dark d-block h-100">
        <div className="premium-card h-100 d-flex flex-column position-relative">
          
          {/* Action Buttons Overlay */}
          <div className="position-absolute top-0 end-0 p-3 d-flex gap-2" style={{ zIndex: 10 }}>
            <button 
              className={`btn btn-sm rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center ${isSaved ? 'bg-primary text-white' : 'bg-white text-muted'}`}
              style={{ width: '36px', height: '36px' }}
              onClick={handleSave}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="premium-card-img-wrapper position-relative" style={{ height: '220px' }}>
            <img
              src={college.image}
              alt={college.name}
              className="premium-card-img w-100 h-100 object-fit-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop'
              }}
            />
            {/* Gradient Overlay for bottom text readability if needed */}
            <div className="position-absolute bottom-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}></div>
            
            <div className="position-absolute bottom-0 start-0 p-3">
              <div className="badge bg-white text-dark d-flex align-items-center gap-1 shadow-sm px-2 py-1">
                <Star size={14} className="text-warning" fill="currentColor" />
                <span className="fw-bold">{college.rating}</span>
                <span className="text-muted small ms-1">({college.reviews})</span>
              </div>
            </div>
          </div>

          <div className="card-body p-4 d-flex flex-column flex-grow-1">
            <div className="mb-3">
              <h5 className="fw-bold mb-2 tracking-tight text-truncate" title={college.name}>
                {college.name}
              </h5>
              <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                <MapPin size={14} />
                {college.location}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {college.courses?.slice(0, 3).map((course, idx) => (
                <span key={idx} className="badge bg-light text-secondary border fw-normal px-2 py-1 rounded-pill">
                  {course}
                </span>
              ))}
              {college.courses?.length > 3 && (
                <span className="badge bg-light text-secondary border fw-normal px-2 py-1 rounded-pill">
                  +{college.courses.length - 3} more
                </span>
              )}
            </div>

            <div className="mt-auto">
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="d-flex flex-column p-2 bg-light rounded-3 h-100 border">
                    <span className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <IndianRupee size={12} /> First Year Fees
                    </span>
                    <span className="fw-bold">₹{(college.fees / 1000).toFixed(1)} L</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex flex-column p-2 bg-primary bg-opacity-10 text-primary rounded-3 h-100 border border-primary border-opacity-25">
                    <span className="small d-flex align-items-center gap-1 mb-1 opacity-75">
                      <Briefcase size={12} /> Avg Package
                    </span>
                    <span className="fw-bold">{college.placements}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-premium-outline w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
                onClick={(e) => handleCompare(e, college)}
              >
                <ArrowRightLeft size={16} />
                Add to Compare
              </button>
            </div>

          </div>
        </div>
      </Link>
    </div>
  )
}

export default React.memo(CollegeCard)