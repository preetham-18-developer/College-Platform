import React from 'react'
import { MapPin, Star, IndianRupee } from 'lucide-react'

const FilterPanel = ({
  selectedLocation,
  setSelectedLocation
}) => {

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <label className="form-label fw-semibold text-dark d-flex align-items-center gap-2 mb-2">
          <MapPin size={16} className="text-primary" /> Location
        </label>
        <select
          className="form-select premium-input"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="">All Locations</option>
          <option value="Visakhapatnam">Visakhapatnam</option>
          <option value="Vijayawada">Vijayawada</option>
          <option value="Nellore">Nellore</option>
          <option value="Guntur">Guntur</option>
        </select>
      </div>

      <div>
        <label className="form-label fw-semibold text-dark d-flex align-items-center gap-2 mb-2">
          <Star size={16} className="text-warning" /> Minimum Rating
        </label>
        <select className="form-select premium-input">
          <option>Any Rating</option>
          <option>4.5+ Rating</option>
          <option>4.0+ Rating</option>
          <option>3.5+ Rating</option>
        </select>
      </div>

      <div>
        <label className="form-label fw-semibold text-dark d-flex align-items-center gap-2 mb-2">
          <IndianRupee size={16} className="text-success" /> Max Fees
        </label>
        <select className="form-select premium-input">
          <option>Any Fees</option>
          <option>Below ₹1,00,000</option>
          <option>Below ₹2,00,000</option>
          <option>Below ₹3,00,000</option>
        </select>
      </div>
      
      <button 
        className="btn btn-premium w-100 mt-2"
        onClick={() => {
          setSelectedLocation('');
        }}
      >
        Clear Filters
      </button>
    </div>
  )
}

export default FilterPanel