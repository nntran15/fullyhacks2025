// App.jsx - Updated to work with Flask backend
"use client";

import React, { useState, useEffect } from 'react';
import CourseSearch from './components/CourseSearch';
import CourseList from './components/CourseList';
import Schedule from './components/Schedule';
import Tabs from './components/Tabs';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [schedules, setSchedules] = useState([{ id: 1, name: 'Schedule 1', courses: [] }]);
  const [activeSchedule, setActiveSchedule] = useState(1);
  const [terms, setTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch available terms from the backend
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/terms');
        if (response.ok) {
          const data = await response.json();
          // Transform term data to match the expected format
          const formattedTerms = data.map(term => ({
            id: term.includes(' ') ? 
              `${term.split(' ')[1]}-${term.split(' ')[0]}` : term,
            name: term
          }));
          
          setTerms(formattedTerms);
          if (formattedTerms.length > 0) {
            setActiveTerm(formattedTerms[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
        // Fallback to default terms if API fails
        const defaultTerms = [
          { id: '2025-Spring', name: 'Spring 2025' },
          { id: '2025-Summer', name: 'Summer 2025' },
          { id: '2025-Fall', name: 'Fall 2025' },
        ];
        setTerms(defaultTerms);
        setActiveTerm(defaultTerms[0].id);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTerms();
  }, []);

  // Search for courses (now uses the transformed data from CourseSearch)
  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  // Add course to schedule
  // Updated addCourseToSchedule function in App.jsx
const addCourseToSchedule = (course, sectionIds) => {
  const currentSchedule = schedules.find(s => s.id === activeSchedule);

  if (!currentSchedule) return;

  // Check if this course is already in the schedule
  const existingCourse = currentSchedule.courses.find(c => c.code === course.code);

  if (existingCourse) {
    alert(`${course.code} is already in your schedule. Remove it first if you want to change sections.`);
    return;
  }

  // Get selected sections
  const selectedSections = course.sections.filter(section =>
    sectionIds.includes(section.id)
  );

  // Add the course with its selected sections
  const updatedCourse = {
    ...course,
    selectedSections
  };

  const updatedSchedules = schedules.map(schedule => {
    if (schedule.id === activeSchedule) {
      return {
        ...schedule,
        courses: [...schedule.courses, updatedCourse]
      };
    }
    return schedule;
  });

  setSchedules(updatedSchedules);

  // Show confirmation
  alert(`Added ${course.code} to your schedule!`);
};

  // Remove course from schedule
  const removeCourseFromSchedule = (courseId) => {
    const currentSchedule = schedules.find(s => s.id === activeSchedule);

    if (!currentSchedule) return;

    // Find the course to be removed (for notification)
    const courseToRemove = currentSchedule.courses.find(c => c.id === courseId);

    // Update schedules
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.id === activeSchedule) {
        return {
          ...schedule,
          courses: schedule.courses.filter(c => c.id !== courseId)
        };
      }
      return schedule;
    });

    setSchedules(updatedSchedules);

    // Show confirmation if course was found and removed
    if (courseToRemove) {
      console.log(`Removed ${courseToRemove.code} from your schedule`);
    }
  };

  // Add new schedule
  const addSchedule = () => {
    const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
    setSchedules([...schedules, { id: newId, name: `Schedule ${newId}`, courses: [] }]);
    setActiveSchedule(newId);
  };

  // Delete schedule
  const deleteSchedule = (id) => {
    if (schedules.length <= 1) {
      alert("You cannot delete your only schedule");
      return;
    }

    const updatedSchedules = schedules.filter(s => s.id !== id);
    setSchedules(updatedSchedules);

    // Set active schedule to first one if current active is deleted
    if (activeSchedule === id) {
      setActiveSchedule(updatedSchedules[0].id);
    }
  };

  // Rename schedule
  const renameSchedule = (id, newName) => {
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.id === id) {
        return { ...schedule, name: newName };
      }
      return schedule;
    });

    setSchedules(updatedSchedules);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Course Scheduler</h1>
        <div className="term-selector">
          <label>Term: </label>
          <select
            value={activeTerm}
            onChange={(e) => setActiveTerm(e.target.value)}
          >
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <CourseSearch 
            onSearch={handleSearchResults} 
            activeTerm={activeTerm}
          />
          <CourseList
            courses={searchResults}
            onAddCourse={addCourseToSchedule}
          />
        </div>

        <div className="right-panel">
          <Tabs
            schedules={schedules}
            activeSchedule={activeSchedule}
            onChangeSchedule={setActiveSchedule}
            onAddSchedule={addSchedule}
            onDeleteSchedule={deleteSchedule}
            onRenameSchedule={renameSchedule}
          />
          <Schedule
            schedule={schedules.find(s => s.id === activeSchedule) || schedules[0]}
            onRemoveCourse={removeCourseFromSchedule}
          />
        </div>
      </div>
    </div>
  );
}

export default App;