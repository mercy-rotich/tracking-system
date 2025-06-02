import React, { useState } from 'react';
import BottleneckItem from './BottleneckItem';
import './WorkflowBottlenecks.css'

const WorkflowBottlenecks = () => {
  const [bottlenecks, setBottlenecks] = useState([
    {
      id: 1,
      committee: 'Dean Committee',
      description: '8 curricula pending > 7 days',
      severity: 'critical',
      icon: 'fas fa-exclamation-triangle',
      action: 'dean'
    },
    {
      id: 2,
      committee: 'School Board',
      description: '5 curricula pending > 5 days',
      severity: 'warning',
      icon: 'fas fa-clock',
      action: 'board'
    },
    {
      id: 3,
      committee: 'CUE External Review',
      description: '3 curricula awaiting response',
      severity: 'info',
      icon: 'fas fa-info-circle',
      action: 'cue'
    }
  ]);

  const handleSendReminder = (action, committeeId) => {
    // TODO: Implement API call to send reminder
    console.log(`Sending reminder to ${action}...`);
    
    // Show success feedback (you might want to use a toast notification library)
    alert(`Reminder sent successfully to ${action}!`);
    
    // Optional: Update state to reflect the action was taken
    setBottlenecks(prev => prev.map(item => 
      item.id === committeeId 
        ? { ...item, lastReminderSent: new Date().toISOString() }
        : item
    ));
  };

  const handleViewDetails = () => {
    // TODO: Navigate to detailed workflow view
    console.log('Navigating to workflow details...');
  };

  return (
    <div className="workflow-bottlenecks">
      <div className="bottlenecks-header">
        <h2 className="section-title">Workflow Bottlenecks</h2>
        <button 
          className="btn btn-link"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
      
      <div className="bottlenecks-list">
        {bottlenecks.map(bottleneck => (
          <BottleneckItem
            key={bottleneck.id}
            {...bottleneck}
            onSendReminder={handleSendReminder}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowBottlenecks;