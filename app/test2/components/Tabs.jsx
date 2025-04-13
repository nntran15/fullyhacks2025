
import React, { useState } from 'react';

function Tabs({
  schedules,
  activeSchedule,
  onChangeSchedule,
  onAddSchedule,
  onDeleteSchedule,
  onRenameSchedule
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState(null);

  const startRenaming = (scheduleId, currentName) => {
    setRenamingId(scheduleId);
    setNewName(currentName);
    setIsRenaming(true);
  };

  const handleRename = () => {
    if (newName.trim()) {
      onRenameSchedule(renamingId, newName);
    }
    setIsRenaming(false);
    setRenamingId(null);
  };

  return (
    <div className="schedule-tabs">
      <div className="tabs-container">
        {schedules.map(schedule => (
          <div
            key={schedule.id}
            className={`tab ${activeSchedule === schedule.id ? 'active-tab' : ''}`}
          >
            {isRenaming && renamingId === schedule.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
            ) : (
              <span
                className="tab-name"
                onClick={() => onChangeSchedule(schedule.id)}
              >
                {schedule.name}
              </span>
            )}

            <div className="tab-actions">
              <button
                className="rename-tab"
                onClick={() => startRenaming(schedule.id, schedule.name)}
              >
                [✏️]
              </button>
              {schedules.length > 1 && (
                <button
                  className="close-tab"
                  onClick={() => {
                    const confirmDelete = window.confirm(`Are you sure you want to delete the schedule "${schedule.name}"?`);
                    if (confirmDelete) {
                      onDeleteSchedule(schedule.id);
                    }
                  }}
                >
                  [❌]
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          className="add-tab"
          onClick={onAddSchedule}
        >
          [+]
        </button>
      </div>
    </div>
  );
}

export default Tabs;