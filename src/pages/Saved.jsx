import React from 'react'
import Navbar from '../components/Navbar'
import { Bookmark, ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Saved = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-light-subtle min-vh-100 pb-5">
      <Navbar />

      <div className="container py-5">
        <button
          className="btn btn-outline-dark mb-4 rounded-pill d-inline-flex align-items-center gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} /> Back to Search
        </button>

        <div className="mb-5 text-center animate-fade-in">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle shadow-sm mb-4" style={{ width: '64px', height: '64px' }}>
            <Bookmark size={32} fill="currentColor" />
          </div>
          <h1 className="display-5 fw-bold mb-3 tracking-tight">
            Saved Colleges
          </h1>
          <p className="lead text-muted max-w-2xl mx-auto" style={{ maxWidth: '600px' }}>
            Keep track of the colleges you're interested in. Review them later and compare when you're ready.
          </p>
        </div>

        {/* Empty State for now since we don't have a real saved colleges state yet */}
        <div className="text-center py-5 animate-fade-in">
          <div className="bg-white p-5 rounded-4 shadow-sm border mx-auto" style={{ maxWidth: '500px' }}>
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4 text-muted" style={{ width: '80px', height: '80px' }}>
              <Search size={32} />
            </div>
            <h3 className="fw-bold mb-3">No Saved Colleges</h3>
            <p className="text-muted mb-4">You haven't saved any colleges yet. Browse our directory and click the bookmark icon to save colleges you like.</p>
            <button className="btn btn-premium rounded-pill px-4" onClick={() => navigate('/')}>Browse Colleges</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Saved