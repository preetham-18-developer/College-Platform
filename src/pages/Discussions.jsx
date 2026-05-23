import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { MessageSquare, ThumbsUp, Search, User } from 'lucide-react'

const Discussions = () => {
  const [search, setSearch] = useState('')
  
  const discussions = [
    {
      id: 1,
      title: "How are the placements for ECE in JNTU Kakinada this year?",
      author: "Rahul V",
      time: "2 hours ago",
      tags: ["Placements", "ECE", "JNTUK"],
      replies: 12,
      upvotes: 45
    },
    {
      id: 2,
      title: "Hostel facilities comparison: KL University vs VIT-AP",
      author: "Priya S",
      time: "5 hours ago",
      tags: ["Hostel", "KLU", "VITAP"],
      replies: 28,
      upvotes: 32
    },
    {
      id: 3,
      title: "Is it worth taking education loan for private universities?",
      author: "Anonymous",
      time: "1 day ago",
      tags: ["Fees", "Loan", "General"],
      replies: 56,
      upvotes: 89
    },
    {
      id: 4,
      title: "Which college has the best coding culture in AP?",
      author: "TechGeek",
      time: "2 days ago",
      tags: ["Coding", "CSE", "Campus Life"],
      replies: 41,
      upvotes: 112
    }
  ]

  return (
    <div className="bg-light-subtle min-vh-100 pb-5">
      <Navbar />
      
      <div className="container py-5">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center animate-fade-in">
            <h1 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-3">
              <MessageSquare className="text-primary" size={36} /> 
              Student Community
            </h1>
            <p className="lead text-muted">
              Ask questions, share experiences, and connect with students and alumni.
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '90px' }}>
              <div className="premium-card p-4 mb-4">
                <h5 className="fw-bold mb-3">Popular Topics</h5>
                <div className="d-flex flex-wrap gap-2">
                  {['Placements', 'Admissions 2024', 'Hostel Life', 'Coding Culture', 'Fees & Loans', 'Branch Change'].map(tag => (
                    <span key={tag} className="badge bg-light text-dark border px-3 py-2 rounded-pill hover-bg-light transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="premium-card p-4 bg-primary text-white border-0">
                <h5 className="fw-bold mb-3">Have a question?</h5>
                <p className="small mb-4 opacity-75">Get answers from thousands of students and alumni across India.</p>
                <button className="btn btn-light w-100 fw-bold text-primary rounded-pill">Ask Question</button>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="position-relative flex-grow-1">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                  type="text" 
                  className="form-control premium-input ps-5 rounded-pill" 
                  placeholder="Search discussions..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="form-select premium-input w-auto rounded-pill">
                <option>Recent</option>
                <option>Top Voted</option>
                <option>Unanswered</option>
              </select>
            </div>

            <div className="d-flex flex-column gap-3">
              {discussions.map(post => (
                <div key={post.id} className="premium-card p-4 hover-bg-light transition-all cursor-pointer">
                  <div className="d-flex gap-3">
                    <div className="d-flex flex-column align-items-center gap-1">
                      <button className="btn btn-sm btn-light rounded bg-light-subtle text-muted hover-text-primary border-0 p-2">
                        <ThumbsUp size={16} />
                      </button>
                      <span className="fw-bold text-muted small">{post.upvotes}</span>
                    </div>
                    
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-2 text-dark">{post.title}</h5>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="badge bg-light text-secondary border fw-normal">{tag}</span>
                        ))}
                      </div>
                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <div className="d-flex align-items-center gap-2">
                          <User size={14} />
                          <span className="fw-medium text-dark">{post.author}</span>
                          <span>• {post.time}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1 fw-medium">
                          <MessageSquare size={14} /> {post.replies} Replies
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <button className="btn btn-premium-outline rounded-pill px-4">Load More Discussions</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discussions
