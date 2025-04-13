// components/CourseSearch.jsx
import React, { useState } from 'react';

function CourseSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  
  // Mock departments
  const departments = [
    { id: 'COMPSCI', name: 'Computer Science' },
    { id: 'MATH', name: 'Mathematics' },
    { id: 'BIO', name: 'Biology' },
    { id: 'CHEM', name: 'Chemistry' },
    { id: 'STATS', name: 'Statistics' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <div className="course-search">
      <h2>Find Courses</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-group">
          <label>Department:</label>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        
        <div className="search-group">
          <label>Search:</label>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter course code, title, or instructor"
          />
        </div>
        
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
}

export default CourseSearch;
