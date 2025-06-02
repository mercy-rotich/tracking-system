import React from 'react';

const ActivityItem = ({ 
  title, 
  description, 
  time, 
  icon, 
  color 
}) => {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${color}`}>
        <i className={icon}></i>
      </div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <p className="activity-description">{description}</p>
        <p className="activity-time">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;