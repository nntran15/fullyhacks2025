// WeeklyCalendar.jsx - Fixed version with robust time parsing

import React from 'react';
import './WeeklyCalendar.css';

function WeeklyCalendar({ events, onRemoveEvent }) {
  // Define the days of the week and time slots
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [];
  
  // Generate time slots from 7:00am to 10:00pm in 30 min increments
  for (let hour = 7; hour <= 22; hour++) {
    const amPm = hour < 12 ? 'am' : 'pm';
    const displayHour = hour <= 12 ? hour : hour - 12;
    timeSlots.push(`${displayHour}:00${amPm}`);
    if (hour < 22) {
      timeSlots.push(`${displayHour}:30${amPm}`);
    }
  }

  // DEBUG: Log all events immediately to check input format
  console.log('Raw events:', events);

  // Helper to convert time string to minutes since midnight - ROBUST VERSION
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
  
    const cleanTime = timeStr.replace(/\s/g, '');
    const timeMatch = cleanTime.match(/(\d+):(\d+)([AP]M)/i);
  
    if (!timeMatch) {
      console.error("Failed to parse time string:", timeStr);
      return 0;
    }
  
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();
  
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
  
    return hours * 60 + minutes;
  };

  // Calculate the vertical position of an event
  const getTimePosition = (startTime) => {
    const minutes = timeToMinutes(startTime);
    const startOfDay = 7 * 60; // 7:00 AM in minutes
    return (minutes - startOfDay) * (80 / 60); // 40px per hour, 2/3px per minute
  };

  // Calculate the height of an event
  const getEventHeight = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    return (endMinutes - startMinutes) * (80 / 60); // 40px per hour, 2/3px per minute
  };

  console.log('Start time position:', getTimePosition('5:30PM')); // Should be correct
  console.log('Event height:', getEventHeight('5:30PM', '6:45PM')); // Should match duration

  // Group events by day
  const eventsByDay = days.reduce((acc, day) => {
    acc[day] = events.filter(event => event.day === day);
    return acc;
  }, {});
  
  // Sort events within each day
  Object.keys(eventsByDay).forEach(day => {
    eventsByDay[day].sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
  });

  // Find overlapping events and organize them
  const organizeOverlappingEvents = (events) => {
    if (!events.length) return [];
    
    // Group events by overlap
    const groups = [];
    let currentGroup = [events[0]];
    
    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      const previousEvent = events[i - 1];
      
      // Check if current event overlaps with previous event
      if (timeToMinutes(event.startTime) < timeToMinutes(previousEvent.endTime)) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    }
    
    if (currentGroup.length) {
      groups.push(currentGroup);
    }
    
    // For each group, calculate position and width
    return groups.flatMap(group => {
      return group.map((event, index) => {
        return {
          ...event,
          width: 100 / group.length,
          left: (index * (100 / group.length))
        };
      });
    });
  };

  // Process events for each day
  const processedEventsByDay = {};
  days.forEach(day => {
    processedEventsByDay[day] = organizeOverlappingEvents(eventsByDay[day]);
  });

  // Generate random colors for each unique course
  const courseColors = {};
  events.forEach(event => {
    if (!courseColors[event.course]) {
      const hue = Math.floor(Math.random() * 360);
      courseColors[event.course] = `hsla(${hue}, 70%, 60%, 0.85)`;
    }
  });

  // Debug logging for event positioning
  const debugEvents = events.map(event => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);
    const top = getTimePosition(event.startTime);
    const height = getEventHeight(event.startTime, event.endTime);
    
    return {
      ...event,
      startMinutes,
      endMinutes,
      top,
      height
    };
  });
  
  console.log('Debug events:', debugEvents);

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <div className="time-column"></div>
        {days.map(day => (
          <div key={day} className="day-column-header">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-body">
        <div className="time-column">
          {timeSlots.map(time => (
            <div key={time} className="time-slot">
              <span className="time-label">{time}</span>
            </div>
          ))}
        </div>
        
        {days.map(day => (
          <div key={day} className="day-column">
            {[...Array(timeSlots.length + 1)].map((_, index) => (
              <div 
                key={index} 
                className="calendar-grid-line"
                style={{ 
                  top: `${index * 40}px`,
                  height: index === timeSlots.length ? '1px' : '40px'
                }}
              ></div>
            ))}
            
            {processedEventsByDay[day].map((event, index) => {
              const top = getTimePosition(event.startTime);
              const height = getEventHeight(event.startTime, event.endTime);
              const backgroundColor = courseColors[event.course];
              
              return (
                <div 
                  key={`${event.course}-${index}`}
                  className="calendar-event"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    width: `${event.width}%`,
                    left: `${event.left}%`,
                    backgroundColor
                  }}
                  title={`${event.course} - ${event.title} (${event.startTime}-${event.endTime})`}
                >
                  <div className="event-content">
                    <div className="event-header">
                      <div className="event-title">{event.course}</div>
                      {onRemoveEvent && (
                        <button 
                          className="event-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveEvent(event.courseId, event.course);
                          }}
                          aria-label={`Remove ${event.course}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="event-details">
                      <div>{event.startTime}-{event.endTime}</div>
                      <div>{event.course} - {event.section}</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyCalendar;