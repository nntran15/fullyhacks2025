// components/WeeklyCalendar.jsx
import React from 'react';

function WeeklyCalendar({ events }) {
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

  // Helper to convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    // Parse time like "10:00am" or "2:30pm" or "10:50am"
    const [time, amPm] = timeStr.split(/([ap]m)/).filter(Boolean);
    let [hours, minutes] = time.split(':').map(Number);
    
    if (amPm === 'pm' && hours !== 12) {
      hours += 12;
    } else if (amPm === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Helper to convert time to vertical position
  const getTimePosition = (timeStr) => {
    const minutes = timeToMinutes(timeStr);
    const startMinutes = 7 * 60; // 7:00am
    
    // Calculate pixels per minute (40px per 30min = 1.33px per minute)
    const pixelsPerMinute = 40 / 30;
    
    return (minutes - startMinutes) * pixelsPerMinute;
  };

  // Calculate event height based on exact start and end times
  const getEventHeight = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    
    // Convert minutes to pixels (40px per 30min)
    const pixelsPerMinute = 40 / 30;
    return durationMinutes * pixelsPerMinute;
  };

  // Group events by day
  const eventsByDay = days.reduce((acc, day) => {
    acc[day] = events.filter(event => event.day === day);
    return acc;
  }, {});
  
  // Sort events within each day to handle overlaps
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
            {/* Time grid lines */}
            {timeSlots.map((time, index) => (
              <div key={index} className="calendar-grid-line"></div>
            ))}
            
            {/* Events */}
            {processedEventsByDay[day].map((event, index) => {
              const top = getTimePosition(event.startTime);
              const height = getEventHeight(event.startTime, event.endTime);
              
              return (
                <div 
                  key={`${event.course}-${index}`}
                  className="calendar-event"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    width: `${event.width}%`,
                    left: `${event.left}%`
                  }}
                  title={`${event.course} - ${event.title} (${event.startTime}-${event.endTime})`}
                >
                  <div className="event-content">
                    <div className="event-title">{event.course}</div>
                    <div className="event-details">
                      <div>{event.section}</div>
                      <div>{event.location}</div>
                      <div>{event.startTime}-{event.endTime}</div>
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