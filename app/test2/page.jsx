// App.jsx - With enhanced course removal
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
  const [terms, setTerms] = useState([
    { id: '2025-Spring', name: 'Spring 2025' },
    { id: '2025-Summer', name: 'Summer 2025' },
    { id: '2025-Fall', name: 'Fall 2025' },
  ]);
  const [activeTerm, setActiveTerm] = useState('2025-Spring');

  // Mock data for demonstration
  const mockCourseData = [
    {
      id: 'COMPSCI161',
      code: 'COMPSCI 161',
      title: 'Design and Analysis of Algorithms',
      department: 'Computer Science',
      sections: [
        { 
          id: '36520', 
          type: 'Lec', 
          instructor: 'Goodrich, M.', 
          time: 'MWF 10:00-10:50am', 
          location: 'HSLH 100A',
          status: 'OPEN',
          enrollment: '120/150'
        },
        { 
          id: '36521', 
          type: 'Dis', 
          instructor: 'TA', 
          time: 'M 1:00-1:50pm', 
          location: 'SSL 140',
          status: 'OPEN',
          enrollment: '30/30'
        }
      ]
    },
    {
      id: 'COMPSCI143A',
      code: 'COMPSCI 143A', 
      title: 'Principles of Operating Systems',
      department: 'Computer Science',
      sections: [
        { 
          id: '36530', 
          type: 'Lec', 
          instructor: 'Wong, A.', 
          time: 'TuTh 11:00-12:20pm', 
          location: 'MSTB 118',
          status: 'OPEN',
          enrollment: '80/100'
        },
        { 
          id: '36531', 
          type: 'Dis', 
          instructor: 'TA', 
          time: 'F 1:00-1:50pm', 
          location: 'ICS 174',
          status: 'OPEN',
          enrollment: '25/30'
        }
      ]
    }
  ];

  // Search for courses (mock implementation)
  const searchCourses = (query) => {
    if (!query) return setSearchResults([]);
    
    // Filter mock data based on query
    const results = mockCourseData.filter(course => 
      course.code.toLowerCase().includes(query.toLowerCase()) || 
      course.title.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Add course to schedule
  const addCourseToSchedule = (course, sectionIds) => {
    const currentSchedule = schedules.find(s => s.id === activeSchedule);
    
    if (!currentSchedule) return;
    
    // Check if course already exists in schedule
    if (currentSchedule.courses.some(c => c.id === course.id)) {
      alert(`${course.code} is already in your schedule!`);
      return;
    }
    
    // Get selected sections
    const selectedSections = course.sections.filter(section => 
      sectionIds.includes(section.id)
    );
    
    const updatedCourse = {
      ...course,
      selectedSections
    };
    
    // Update the schedule
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
          <CourseSearch onSearch={searchCourses} />
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