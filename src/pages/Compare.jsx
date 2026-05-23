import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Check, X, MapPin, Star, IndianRupee, Briefcase, GraduationCap, Building } from 'lucide-react'

const Compare = () => {

  const navigate = useNavigate()
  const [compareColleges, setCompareColleges] = useState([])

  useEffect(() => {
    const storedColleges = JSON.parse(localStorage.getItem('compareColleges')) || []
    setCompareColleges(storedColleges)
  }, [])

  const handleRemove = (id) => {
    const updatedColleges = compareColleges.filter((college) => college.id !== id)
    setCompareColleges(updatedColleges)
    localStorage.setItem('compareColleges', JSON.stringify(updatedColleges))
  }

  // Helper to find best value in a row to highlight it
  const getBestFee = () => {
    if (compareColleges.length === 0) return null;
    return Math.min(...compareColleges.map(c => c.fees));
  }
  
  const getBestRating = () => {
    if (compareColleges.length === 0) return null;
    return Math.max(...compareColleges.map(c => c.rating));
  }

  const bestFee = getBestFee();
  const bestRating = getBestRating();

  return (
    <div className="bg-light-subtle min-vh-100">
      <Navbar />

      <div className="container py-5">

        <button
          className="btn btn-outline-dark mb-4 rounded-pill d-inline-flex align-items-center gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} /> Back to Search
        </button>

        <div className="mb-5 text-center animate-fade-in">
          <h1 className="display-5 fw-bold mb-3 tracking-tight">
            Compare Colleges
          </h1>
          <p className="lead text-muted max-w-2xl mx-auto" style={{ maxWidth: '600px' }}>
            Evaluate your selected colleges side-by-side to make the best decision for your future.
          </p>
        </div>

        {
          compareColleges.length === 0 ? (
            <div className="text-center py-5 animate-fade-in">
              <div className="bg-white p-5 rounded-4 shadow-sm border mx-auto" style={{ maxWidth: '500px' }}>
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4 text-muted" style={{ width: '80px', height: '80px' }}>
                  <Building size={32} />
                </div>
                <h3 className="fw-bold mb-3">No Colleges Selected</h3>
                <p className="text-muted mb-4">You haven't added any colleges to compare yet. Go back to the search page and add up to 3 colleges to see them side-by-side.</p>
                <button className="btn btn-premium rounded-pill px-4" onClick={() => navigate('/')}>Browse Colleges</button>
              </div>
            </div>
          ) : (
            <div className="premium-card p-0 animate-fade-in overflow-hidden" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0" style={{ minWidth: '800px' }}>
                  <thead className="bg-white border-bottom sticky-top" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="p-4 text-muted fw-semibold bg-white" style={{ width: '20%' }}>
                        Compare Features
                      </th>
                      {
                        compareColleges.map((college) => (
                          <th key={college.id} className="p-4 border-start bg-white" style={{ width: `${80 / compareColleges.length}%` }}>
                            <div className="d-flex flex-column gap-3">
                              <div className="position-relative rounded-3 overflow-hidden shadow-sm" style={{ height: '120px' }}>
                                <img src={college.image} alt={college.name} className="w-100 h-100 object-fit-cover" />
                                <div className="position-absolute top-0 end-0 p-2">
                                  <button
                                    className="btn btn-sm btn-danger rounded-circle p-2 shadow hover-scale"
                                    onClick={() => handleRemove(college.id)}
                                    title="Remove from compare"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <h5 className="fw-bold mb-0 text-dark tracking-tight">{college.name}</h5>
                            </div>
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  
                  <tbody>
                    {/* Location */}
                    <tr className="border-bottom">
                      <td className="p-4 bg-light fw-semibold text-muted d-flex align-items-center gap-2 border-0 h-100 m-0">
                        <MapPin size={18} /> Location
                      </td>
                      {
                        compareColleges.map((college) => (
                          <td key={college.id} className="p-4 border-start fs-6">
                            {college.location}
                          </td>
                        ))
                      }
                    </tr>

                    {/* Fees */}
                    <tr className="border-bottom">
                      <td className="p-4 bg-light fw-semibold text-muted d-flex align-items-center gap-2 border-0">
                        <IndianRupee size={18} /> First Year Fees
                      </td>
                      {
                        compareColleges.map((college) => (
                          <td key={college.id} className="p-4 border-start fs-6">
                            <span className={`fw-medium ${college.fees === bestFee ? 'text-success d-inline-flex align-items-center gap-1' : ''}`}>
                              ₹ {college.fees.toLocaleString()}
                              {college.fees === bestFee && <Check size={16} className="text-success" />}
                            </span>
                          </td>
                        ))
                      }
                    </tr>

                    {/* Rating */}
                    <tr className="border-bottom">
                      <td className="p-4 bg-light fw-semibold text-muted d-flex align-items-center gap-2 border-0">
                        <Star size={18} /> Student Rating
                      </td>
                      {
                        compareColleges.map((college) => (
                          <td key={college.id} className="p-4 border-start fs-6">
                            <span className={`fw-medium d-inline-flex align-items-center gap-1 ${college.rating === bestRating ? 'text-primary' : ''}`}>
                              <Star size={16} fill={college.rating === bestRating ? 'currentColor' : 'none'} className={college.rating === bestRating ? 'text-primary' : 'text-warning'} /> 
                              {college.rating} / 5.0
                              {college.rating === bestRating && <span className="badge bg-primary ms-1">Best</span>}
                            </span>
                          </td>
                        ))
                      }
                    </tr>

                    {/* Placements */}
                    <tr className="border-bottom">
                      <td className="p-4 bg-light fw-semibold text-muted d-flex align-items-center gap-2 border-0">
                        <Briefcase size={18} /> Avg Placement
                      </td>
                      {
                        compareColleges.map((college) => (
                          <td key={college.id} className="p-4 border-start fs-6 fw-medium">
                            {college.placements}
                          </td>
                        ))
                      }
                    </tr>

                    {/* Courses */}
                    <tr>
                      <td className="p-4 bg-light fw-semibold text-muted d-flex align-items-center gap-2 border-0">
                        <GraduationCap size={18} /> Top Courses
                      </td>
                      {
                        compareColleges.map((college) => (
                          <td key={college.id} className="p-4 border-start">
                            <div className="d-flex flex-wrap gap-2">
                              {college.courses.map(course => (
                                <span key={course} className="badge bg-light text-dark border fw-normal">{course}</span>
                              ))}
                            </div>
                          </td>
                        ))
                      }
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-light p-3 text-center border-top text-muted small sticky-bottom" style={{ zIndex: 10 }}>
                Add up to 3 colleges to compare them side-by-side. Data is updated regularly.
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Compare