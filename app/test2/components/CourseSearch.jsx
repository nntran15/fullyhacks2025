import React, { useState, useEffect } from 'react';

function CourseSearch({ onSearch, activeTerm }) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/departments');
        if (response.ok) {
          const data = await response.json();
          const sortedDepartments = data.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setDepartments(sortedDepartments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // convert parts to term
      const termParts = activeTerm.split('-');
      const formattedTerm = termParts.length > 1 ? `${termParts[1]} ${termParts[0]}` : activeTerm;
      
      // where the api is stored
      let url = `http://127.0.0.1:5000/api/classes?term=${encodeURIComponent(formattedTerm)}`;
      
      // send an api query using just department name
      if (department) {
        const selectedDept = departments.find(dept => dept.id === department);
        if (selectedDept) {
          url += `&subject=${encodeURIComponent(selectedDept.name)}`;
        }
      }
      
      // send an api query using just search 
      if (query) {
        url += `&query=${encodeURIComponent(query)}`;
      }
      
      // response
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // retrieve data and format it
        const transformedData = data.map(course => ({
          id: `${course["Class ID"]}`,
          code: course["Class Name"].split(' - ')[0],
          title: course["Class Name"].split(' - ')[1] || '',
          department: department ? departments.find(dept => dept.id === department)?.name : '',
          sections: [{
            id: `${course["Class ID"]}`,
            type: course["Section"].split('-')[1]?.split('\n')[0]?.trim() || 'LEC',
            time: course["Time"],
            location: course["Room"]
          }]
        }));
        
        onSearch(transformedData);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      onSearch([]);
    } finally {
      setLoading(false);
    }
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
            <option value=""></option>
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
        
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}

export default CourseSearch;