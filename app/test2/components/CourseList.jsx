import React, { useState, useEffect } from 'react';

function CourseList({ courses, onAddCourse }) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedSections, setSelectedSections] = useState({});
  const [groupedCourses, setGroupedCourses] = useState([]);
  
  // group courses together
  useEffect(() => {
    if (!courses.length) {
      setGroupedCourses([]);
      return;
    }
    
    const courseMap = {};
    
    courses.forEach(course => {
      const courseKey = course.code;
      
      if (!courseMap[courseKey]) {
        courseMap[courseKey] = {
          id: courseKey,
          code: course.code,
          title: course.title,
          department: course.department,
          sections: []
        };
      }
      
      courseMap[courseKey].sections.push(...course.sections);
    });
    
    // convert map to array 
    const groupedArray = Object.values(courseMap);
    
    // remove duplicates
    groupedArray.forEach(course => {
      const uniqueSections = [];
      const sectionIds = new Set();
      
      course.sections.forEach(section => {
        if (!sectionIds.has(section.id)) {
          sectionIds.add(section.id);
          uniqueSections.push(section);
        }
      });
      
      course.sections = uniqueSections;
    });
    
    setGroupedCourses(groupedArray);
  }, [courses]);
  
  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
    setSelectedSections({});
  };
  
  const toggleSection = (courseId, sectionId) => {
    setSelectedSections({
      ...selectedSections,
      [courseId]: [sectionId],
    });
  };
  
  const handleAddCourse = (course) => {
    const sectionsToAdd = selectedSections[course.id] || [];
    if (sectionsToAdd.length === 0) return;
    
    onAddCourse(course, sectionsToAdd);
    setSelectedSections(prev => ({
      ...prev,
      [course.id]: []
    }));
  };
  
  return (
    <div className="course-list">
      <h2>Search Results</h2>
      {groupedCourses.length === 0 ? (
        <p>No courses to display. Please search above.</p>
      ) : (
        <ul className="results-list">
          {groupedCourses.map((course) => (
            <li key={course.id} className="course-item">
              <div className="course-header" onClick={() => toggleCourse(course.id)}>
                <h3>{course.code}: {course.title}</h3>
                <span className="toggle-icon">
                  {expandedCourse === course.id ? '−' : '+'}
                </span>
              </div>
              
              {expandedCourse === course.id && (
                <div className="course-details">
                  <p><strong>Department:</strong> {course.department}</p>
                  
                  <h4>Sections:</h4>
                  <table className="sections-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Instructor</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.sections.map((section) => (
                        <tr key={section.id}>
                          <td>
                            <input 
                              type="checkbox"
                              checked={(selectedSections[course.id] || []).includes(section.id)}
                              onChange={() => toggleSection(course.id, section.id)}
                            />
                          </td>
                          <td>{section.id}</td>
                          <td>{section.type}</td>
                          <td>{section.instructor}</td>
                          <td>{section.time}</td>
                          <td>{section.location}</td>
                          <td className={section.status === 'OPEN' ? 'status-open' : 'status-closed'}>
                            {section.status} 
                            {section.enrollment && `(${section.enrollment})`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <button 
                    className="add-course-button"
                    onClick={() => handleAddCourse(course)}
                    disabled={(selectedSections[course.id] || []).length === 0}
                  >
                    Add to Schedule
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;