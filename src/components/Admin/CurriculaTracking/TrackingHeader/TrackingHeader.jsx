import React from 'react';
import './TrackingHeader.css';

const TrackingHeader = ({ onRefresh, onInitiateCurriculum }) => {
  return (
    <div className="tracking-header">
      <div className="tracking-header-content">
        <div className="tracking-header-text">
          <h1 className="tracking-title">
            <i className="fas fa-route tracking-icon"></i>
            Curriculum Tracking
          </h1>
          <p className="tracking-subtitle">
            Monitor curriculum progress through all approval stages
          </p>
        </div>
        
        <div className="tracking-header-actions">
          {/* Action Buttons */}
          <button 
            className="tracking-btn tracking-btn-outline tracking-btn-sm"
            onClick={onRefresh}
            title="Refresh tracking data"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
          
          <button 
            className="tracking-btn tracking-btn-secondary tracking-btn-sm"
            onClick={() => window.print()}
            title="Print current view"
          >
            <i className="fas fa-print"></i>
            Print
          </button>
          
          <button 
            className="tracking-btn tracking-btn-secondary tracking-btn-sm"
            title="Export tracking report"
          >
            <i className="fas fa-download"></i>
            Export Report
          </button>
          
          <button 
            className="tracking-btn tracking-btn-primary tracking-btn-sm"
            onClick={onInitiateCurriculum}
            title="Start new curriculum tracking"
          >
            <i className="fas fa-plus"></i>
            New Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingHeader;