import React from 'react';
import WeeklyCalendar from './WeeklyCalendar';

function Schedule({ schedule, onRemoveCourse }) {
  if (!schedule) return <div>No schedule selected</div>;

  const parseTimeString = (timeStr) => {
    if (!timeStr || timeStr === "TBA") return { days: [], startTime: '', endTime: '' };
    
    console.log('Parsing schedule time string:', timeStr);
    const match = timeStr.match(/^([A-Za-z]+)\s+(.+)$/);

if (!match) {
  console.error('Invalid time string format:', timeStr);
  return { days: [], startTime: '', endTime: '' };
}
const daysStr = match[1].trim();
const timePart = match[2].trim();
  
    const timeMatch = timePart.match(/(\d+:\d+(?:AM|PM)?)\s*-\s*(\d+:\d+(?:AM|PM)?)/i);
    if (!timeMatch) {
      console.error('Could not extract start and end times:', timePart);
      return { days: [], startTime: '', endTime: '' };
    }
    
    let startTime = timeMatch[1].trim();
    let endTime = timeMatch[2].trim();
    
    // Add AM/PM
    if (!startTime.toLowerCase().includes('am') && !startTime.toLowerCase().includes('pm')) {
      const periodMatch = endTime.match(/(AM|PM)$/i);
      if (periodMatch) {
        startTime += periodMatch[0];
      }
    }
    
    console.log(`Extracted times: start=${startTime}, end=${endTime}`);
    
    // map days
    const dayMappings = {
      'M': 'Monday', 'Mo': 'Monday',
      'T': 'Tuesday', 'Tu': 'Tuesday',
      'W': 'Wednesday', 'We': 'Wednesday',
      'Th': 'Thursday',
      'F': 'Friday', 'Fr': 'Friday'
    };
    
    const parsedDays = [];
    
    let remainingStr = daysStr;
    while (remainingStr.length > 0) {
      let matched = false;
      
      // Check two-letter abbreviations first
      for (const [abbr, day] of Object.entries(dayMappings)) {
        if (abbr.length === 2 && remainingStr.startsWith(abbr)) {
          parsedDays.push(day);
          remainingStr = remainingStr.substring(abbr.length);
          matched = true;
          break;
        }
      }
      
      // try one-letter abbreviations
      if (!matched) {
        for (const [abbr, day] of Object.entries(dayMappings)) {
          if (abbr.length === 1 && remainingStr.startsWith(abbr)) {
            parsedDays.push(day);
            remainingStr = remainingStr.substring(abbr.length);
            matched = true;
            break;
          }
        }
      }
      
      // Skip
      if (!matched) {
        remainingStr = remainingStr.substring(1);
      }
    }
    
    console.log('Parsed days:', parsedDays);
    
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
        courseId: course.id
      }));
    }).flat()
  );

  console.log('Calendar events:', calendarEvents);

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
            onRemoveEvent={handleRemoveCourse} 
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