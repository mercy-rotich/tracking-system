import React, { useState } from 'react';
import AlertItem from './AlertItem';
import './SystemAlerts.css'

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Critical Delay Alert',
      description: '5 curricula have been pending at Senate stage for over 14 days',
      icon: 'fas fa-exclamation-triangle',
      actionText: 'Take Action'
    },
    {
      id: 2,
      type: 'warning',
      title: 'CUE Response Overdue',
      description: '3 curricula awaiting CUE response beyond expected timeframe',
      icon: 'fas fa-clock',
      actionText: 'Follow Up'
    },
    {
      id: 3,
      type: 'info',
      title: 'User Login Anomaly',
      description: 'Multiple failed login attempts detected from unusual locations',
      icon: 'fas fa-info-circle',
      actionText: 'View Details'
    }
  ]);

  const activeAlertsCount = alerts.length;

  const handleAlertAction = (alertId, actionType) => {
    // TODO: Implement specific actions based on alert type
    console.log(`Handling ${actionType} for alert ${alertId}`);
    
    // Example: Mark alert as addressed or take specific action
    switch (actionType) {
      case 'Take Action':
        console.log('Taking action on critical delay...');
        break;
      case 'Follow Up':
        console.log('Following up with CUE...');
        break;
      case 'View Details':
        console.log('Opening detailed view...');
        break;
      default:
        console.log('Unknown action');
    }
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="system-alerts">
      <div className="alerts-header">
        <h2 className="section-title">System Alerts</h2>
        <span className="alert-badge">
          {activeAlertsCount} Active
        </span>
      </div>
      
      <div className="alerts-list">
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <AlertItem
              key={alert.id}
              {...alert}
              onAction={handleAlertAction}
              onDismiss={handleDismissAlert}
            />
          ))
        ) : (
          <div className="no-alerts">
            <i className="fas fa-check-circle"></i>
            <p>No active alerts. All systems running smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAlerts;