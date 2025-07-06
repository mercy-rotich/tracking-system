import React, { useState } from 'react';
import './QuickActions.css'

const QuickActions = () => {
  const [loading, setLoading] = useState({});

  const actions = [
    {
      id: 'bulk-reminders',
      title: 'Send Bulk Reminders',
      icon: 'fas fa-bell',
      gradient: 'gradient-green'
    },
    {
      id: 'system-report',
      title: 'Generate System Report',
      icon: 'fas fa-download', 
      gradient: 'gradient-blue'
    },
    {
      id: 'sync-cue',
      title: 'Sync CUE Updates',
      icon: 'fas fa-sync-alt',
      gradient: 'gradient-purple'
    },
    {
      id: 'schedule-inspections',
      title: 'Schedule Site Inspections',
      icon: 'fas fa-calendar-check',
      gradient: 'gradient-orange'
    }
  ];

  const handleAction = async (actionId) => {
    setLoading(prev => ({ ...prev, [actionId]: true }));
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (actionId) {
        case 'bulk-reminders':
          console.log('Sending bulk reminders...');
          alert('Bulk reminders sent successfully!');
          break;
        case 'system-report':
          console.log('Generating system report...');
          alert('System report generated and downloaded!');
          break;
        case 'sync-cue':
          console.log('Syncing CUE updates...');
          alert('CUE updates synchronized!');
          break;
        case 'schedule-inspections':
          console.log('Scheduling site inspections...');
          alert('Site inspections scheduled!');
          break;
        default:
          console.log(`Executing action: ${actionId}`);
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [actionId]: false }));
    }
  };

  return (
    <div className="quick-actions">
      <h2 className="overview-section-title">Quick Actions</h2>
      <div className="actions-grid">
        {actions.map(action => (
          <button
            key={action.id}
            className={`action-btn ${action.gradient} ${loading[action.id] ? 'loading' : ''}`}
            onClick={() => handleAction(action.id)}
            disabled={loading[action.id]}
          >
            <i className={`${action.icon} ${loading[action.id] ? 'fa-spin' : ''}`}></i>
            <span>{action.title}</span>
            {loading[action.id] && <div className="loading-spinner"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;