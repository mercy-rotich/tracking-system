import React from 'react';
import ActivityItem from './ActivityItem';
import './RecentActivity.css'

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'user-deactivation',
      title: 'User account deactivated',
      description: 'John Smith (School Board) - Inactive for 30 days',
      time: '2 hours ago',
      icon: 'fas fa-user-times',
      color: 'red'
    },
    {
      id: 2,
      type: 'curriculum-approval',
      title: 'Curriculum approved',
      description: 'BSc. Cybersecurity moved to CUE Review',
      time: '4 hours ago',
      icon: 'fas fa-check',
      color: 'green'
    },
    {
      id: 3,
      type: 'reminder-sent',
      title: 'Automatic reminder sent',
      description: 'Dean Committee - 3 overdue curricula',
      time: '6 hours ago',
      icon: 'fas fa-bell',
      color: 'yellow'
    },
    {
      id: 4,
      type: 'user-creation',
      title: 'New user created',
      description: 'Dr. Jane Doe assigned to QA Committee',
      time: '8 hours ago',
      icon: 'fas fa-user-plus',
      color: 'blue'
    }
  ];

  const handleViewAll = () => {
   
    console.log('Navigating to full activity log...');
  };

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h2 className="section-title">Recent System Activity</h2>
        <button 
          className="btn btn-link"
          onClick={handleViewAll}
        >
          View All
        </button>
      </div>
      
      <div className="activity-timeline">
        <div className="timeline-line"></div>
        {activities.map(activity => (
          <ActivityItem key={activity.id} {...activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;