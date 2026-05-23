import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, IndianRupee, Briefcase, ExternalLink, MessageSquare, BookOpen, Navigation, GraduationCap } from 'lucide-react'

import colleges from '../data/colleges'
import Navbar from '../components/Navbar'

const CollegeDetails = () => {

  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  const [activeTab, setActiveTab] = useState('overview')

  // If the college data was passed via state (from Home search), use it.
  // Otherwise, fallback to finding it in local data by ID (comparing as strings).
  const college = state?.college || colleges.find((c) => String(c.id) === String(id))

  if (!college) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <h2>College Not Found</h2>
          <button className="btn btn-premium mt-3" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses & Fees' },
    { id: 'placements', label: 'Placements' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'blogs', label: 'Blogs', isExternal: true, link: `https://example.com/blog/${college.name.toLowerCase().replace(/ /g, '-')}` },
    { id: 'official', label: 'Official Website', isExternal: true, link: `https://www.${college.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.in` },
    { id: 'discussion', label: 'Discussion' },
  ]

  return (
    <div className="bg-light-subtle min-vh-100 pb-5">
      <Navbar />

      {/* Hero Section */}
      <div className="position-relative bg-dark text-white" style={{ height: '50vh', minHeight: '400px' }}>
        <div className="position-absolute w-100 h-100 top-0 start-0">
          <img
            src={college.image}
            alt={college.name}
            className="w-100 h-100 object-fit-cover opacity-50"
          />
          <div className="position-absolute w-100 h-100 top-0 start-0 bg-gradient-dark" style={{ background: 'linear-gradient(to top, rgba(17,24,39,1) 0%, rgba(17,24,39,0.4) 100%)' }}></div>
        </div>

        <div className="container position-relative h-100 d-flex flex-column justify-content-end pb-5 z-1">
          <button
            className="btn btn-light bg-white bg-opacity-25 text-white border-0 mb-4 align-self-start d-flex align-items-center gap-2 hover-bg-white hover-text-dark transition-all rounded-pill px-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Back to Search
          </button>

          <div className="row align-items-end">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">Ranked #1</span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 fs-6 rounded-pill d-flex align-items-center gap-1">
                  <Star size={16} fill="currentColor" /> {college.rating} ({college.reviews} Reviews)
                </span>
              </div>
              <h1 className="display-4 fw-bold mb-2 tracking-tight">{college.name}</h1>
              <p className="fs-5 text-light d-flex align-items-center gap-2 mb-0">
                <MapPin size={20} className="text-primary" /> {college.location}, Andhra Pradesh
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg d-inline-flex align-items-center gap-2 transition-all hover-scale">
                Apply Now <Navigation size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-n4 position-relative z-2">
        <div className="premium-card mb-4 overflow-visible">
          {/* Sticky Tabs */}
          <div className="sticky-top bg-white border-bottom premium-tabs px-2 px-md-4" style={{ top: '70px', zIndex: 100 }}>
            <ul className="nav nav-tabs flex-nowrap overflow-auto hide-scrollbar border-0" role="tablist">
              {tabs.map((tab) => (
                <li className="nav-item flex-shrink-0" key={tab.id}>
                  {tab.isExternal ? (
                    <a 
                      href={tab.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link d-flex align-items-center gap-2 text-decoration-none"
                    >
                      {tab.label} <ExternalLink size={14} className="opacity-50" />
                    </a>
                  ) : (
                    <button
                      className={`nav-link fw-semibold fs-6 ${activeTab === tab.id ? 'active border-primary text-primary border-bottom border-3' : 'text-muted'}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 p-md-5">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <BookOpen className="text-primary" /> About College
                </h3>
                <p className="text-muted lead fs-6 lh-lg mb-5">
                  {college.description} {college.name} is recognized as a premier institution offering excellence in engineering education. The campus is equipped with state-of-the-art facilities, modern laboratories, and an expansive library to support comprehensive learning and research.
                </p>
                
                <h4 className="fw-bold mb-4">Highlights</h4>
                <div className="row g-4">
                  {[
                    { icon: <MapPin />, title: "Campus Area", value: "150+ Acres" },
                    { icon: <Briefcase />, title: "Highest Package", value: "45 LPA" },
                    { icon: <GraduationCap />, title: "Total Students", value: "5000+" },
                    { icon: <Star />, title: "Accreditation", value: "NAAC A++" },
                  ].map((stat, idx) => (
                    <div className="col-sm-6 col-lg-3" key={idx}>
                      <div className="d-flex flex-column p-4 bg-light rounded-4 h-100 border border-light-subtle transition-all hover-scale" style={{ cursor: 'default' }}>
                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm mb-3 text-primary" style={{ width: '48px', height: '48px' }}>
                          {stat.icon}
                        </div>
                        <span className="text-muted small fw-medium mb-1">{stat.title}</span>
                        <span className="fw-bold fs-5">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold d-flex align-items-center gap-2">
                    <GraduationCap className="text-primary" /> Courses Offered
                  </h3>
                </div>
                <div className="row g-4">
                  {college.courses.map((course, index) => (
                    <div className="col-md-6" key={index}>
                      <div className="premium-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="fw-bold text-dark mb-0">B.Tech in {course}</h5>
                          <span className="badge bg-light text-dark border">4 Years</span>
                        </div>
                        <p className="text-muted small mb-4 pb-3 border-bottom">Full Time • On Campus</p>
                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            <span className="text-muted small d-block mb-1">First Year Fees</span>
                            <span className="fw-bold fs-5">₹ {college.fees.toLocaleString()}</span>
                          </div>
                          <button className="btn btn-premium-outline btn-sm rounded-pill px-4">Brochure</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placements Tab */}
            {activeTab === 'placements' && (
              <div className="animate-fade-in">
                <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Briefcase className="text-primary" /> Placement Statistics
                </h3>
                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-25 text-center h-100">
                      <p className="text-primary fw-medium mb-2">Average Package</p>
                      <h2 className="fw-bold text-primary mb-0">{college.placements}</h2>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 text-center h-100">
                      <p className="text-success fw-medium mb-2">Highest Package</p>
                      <h2 className="fw-bold text-success mb-0">45 LPA</h2>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 bg-info bg-opacity-10 rounded-4 border border-info border-opacity-25 text-center h-100">
                      <p className="text-info fw-medium mb-2">Placement Rate</p>
                      <h2 className="fw-bold text-info mb-0">94%</h2>
                    </div>
                  </div>
                </div>

                <h4 className="fw-bold mb-3">Top Recruiters</h4>
                <div className="d-flex flex-wrap gap-3">
                  {['TCS', 'Infosys', 'Wipro', 'Amazon', 'Cognizant', 'Accenture', 'Tech Mahindra', 'IBM'].map(recruiter => (
                    <div key={recruiter} className="bg-white border rounded-3 px-4 py-3 text-center shadow-sm fw-medium text-muted hover-bg-light transition-all" style={{ minWidth: '120px' }}>
                      {recruiter}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold d-flex align-items-center gap-2">
                    <Star className="text-primary" fill="currentColor" /> Student Reviews
                  </h3>
                  <button className="btn btn-premium rounded-pill">Write a Review</button>
                </div>
                
                <div className="row g-4">
                  {[1, 2, 3].map((item) => (
                    <div className="col-12" key={item}>
                      <div className="premium-card p-4">
                        <div className="d-flex justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '48px', height: '48px' }}>
                              S{item}
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">Student {item}</h6>
                              <p className="text-muted small mb-0">B.Tech in CSE • Batch of 2024</p>
                            </div>
                          </div>
                          <div className="bg-success text-white px-2 py-1 rounded d-flex align-items-center gap-1 small fw-bold h-100">
                            4.5 <Star size={12} fill="currentColor" />
                          </div>
                        </div>
                        <h6 className="fw-bold mt-2">"Great placements and faculty"</h6>
                        <p className="text-muted mb-0">
                          The college has excellent infrastructure and the faculty is very supportive. The placement cell works hard to bring top companies to campus. Overall, a great experience.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion Tab */}
            {activeTab === 'discussion' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold d-flex align-items-center gap-2">
                    <MessageSquare className="text-primary" /> Q&A Discussion
                  </h3>
                  <button className="btn btn-premium rounded-pill">Ask a Question</button>
                </div>
                
                <div className="row g-4">
                  {[1, 2].map((item) => (
                    <div className="col-12" key={item}>
                      <div className="border rounded-4 p-4 hover-bg-light transition-all cursor-pointer">
                        <h6 className="fw-bold mb-2">What is the strictness level regarding attendance?</h6>
                        <p className="text-muted small mb-3">Asked by Anonymous • 2 days ago</p>
                        <div className="bg-light p-3 rounded-3 border-start border-primary border-4">
                          <p className="mb-0 fw-medium small text-dark">
                            <span className="text-primary fw-bold me-2">Answer:</span>
                            They are quite strict about the 75% attendance rule. You might not be allowed to write exams if you fall short without a valid medical certificate.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default CollegeDetails