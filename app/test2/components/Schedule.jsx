// components/Schedule.jsx
import React from 'react';
import WeeklyCalendar from './WeeklyCalendar';

function Schedule({ schedule, onRemoveCourse }) {
  if (!schedule) return <div>No schedule selected</div>;

  // Helper to parse time strings into schedule objects
  const parseTimeString = (timeStr) => {
    // Parse format like "MWF 10:00-10:50am" or "TuTh 11:00-12:20pm"
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return { days: [], startTime: '', endTime: '' };
    
    const days = parts[0];
    const timeRange = parts[1];
    
    // Handle cases where AM/PM is only specified once at the end
    let [startTime, endTime] = timeRange.split('-');
    
    // Check if endTime has am/pm but startTime doesn't
    if (endTime.includes('am') || endTime.includes('pm')) {
      const suffix = endTime.includes('am') ? 'am' : 'pm';
      
      if (!startTime.includes('am') && !startTime.includes('pm')) {
        startTime = `${startTime}${suffix}`;
      }
    }
    
    // Parse days more accurately
    const parsedDays = [];
    let i = 0;
    
    while (i < days.length) {
      if (days.substring(i, i+2) === 'Tu') {
        parsedDays.push('Tuesday');
        i += 2;
      } else if (days.substring(i, i+2) === 'Th') {
        parsedDays.push('Thursday');
        i += 2;
      } else if (days[i] === 'M') {
        parsedDays.push('Monday');
        i += 1;
      } else if (days[i] === 'W') {
        parsedDays.push('Wednesday');
        i += 1;
      } else if (days[i] === 'F') {
        parsedDays.push('Friday');
        i += 1;
      } else {
        i += 1; // Skip unrecognized characters
      }
    }
    
    return {
      days: parsedDays,
      startTime,
      endTime
    };
  };

  // Format courses for calendar display
  const calendarEvents = schedule.courses.flatMap(course => 
    course.selectedSections.map(section => {
      const timeInfo = parseTimeString(section.time);
      return timeInfo.days.map(day => ({
        day,
        startTime: timeInfo.startTime,
        endTime: timeInfo.endTime,
        course: course.code,
        title: course.title,
        section: section.type,
        location: section.location,
        instructor: section.instructor,
        courseId: course.id // Add courseId for removal
      }));
    }).flat()
  );

  // Function to handle course removal with confirmation
  const handleRemoveCourse = (courseId, courseName) => {
    const confirmRemove = window.confirm(`Remove ${courseName} from your schedule?`);
    if (confirmRemove) {
      onRemoveCourse(courseId);
    }
  };

  return (
    <div className="schedule-view">
      <h2>{schedule.name}</h2>
      
      <div className="schedule-content">
        <div className="calendar-view">
          <WeeklyCalendar 
            events={calendarEvents} 
            onRemoveEvent={(courseId) => handleRemoveCourse(courseId)} 
          />
        </div>
        
        <div className="list-view">
          <h3>Enrolled Courses</h3>
          {schedule.courses.length === 0 ? (
            <p>No courses added yet. Search and add courses from the left panel.</p>
          ) : (
            <ul className="enrolled-courses">
              {schedule.courses.map(course => (
                <li key={course.id} className="enrolled-course">
                  <div className="enrolled-course-header">
                    <h4>{course.code}: {course.title}</h4>
                    <button 
                      className="remove-course"
                      onClick={() => handleRemoveCourse(course.id, course.code)}
                      aria-label={`Remove ${course.code}`}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="enrolled-sections">
                    {course.selectedSections.map(section => (
                      <div key={section.id} className="enrolled-section">
                        <span className="section-code">{section.id}</span>
                        <span className="section-type">{section.type}</span>
                        <span className="section-time">{section.time}</span>
                        <span className="section-location">{section.location}</span>
                        <span className="section-instructor">{section.instructor}</span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedule;