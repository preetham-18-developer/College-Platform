import React from 'react'

const SearchBar = ({ search, setSearch }) => {

  return (
    <input
      type="text"
      className="form-control form-control-lg shadow-sm border-0 rounded-4"
      placeholder="Search colleges by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  )
}

export default SearchBar