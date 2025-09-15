import React, { useState } from 'react';
import './TrackingHeader.css';

const TrackingHeader = ({ 
  onRefresh, 
  onInitiateCurriculum, 
  onViewMode, 
  currentViewMode,
  onShowMyInitiated,
  onShowMyAssigned,
  onShowBySchool,
  onExportData,
  trackingStats 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  const handleViewModeChange = (mode) => {
    if (onViewMode) {
      onViewMode(mode);
    }
  };

  const handleExport = (format) => {
    setExportFormat(format);
    if (onExportData) {
      onExportData(format);
    }
  };

  const handleShowMyData = (type) => {
    switch (type) {
      case 'initiated':
        if (onShowMyInitiated) onShowMyInitiated();
        break;
      case 'assigned':
        if (onShowMyAssigned) onShowMyAssigned();
        break;
      default:
        break;
    }
  };

  const handleShowBySchool = () => {
    const schoolId = prompt('Enter School ID:');
    if (schoolId && onShowBySchool) {
      onShowBySchool(schoolId);
    }
  };

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
          {/* View Mode Toggle */}
          <div className="tracking-view-toggle">
            
            <button
              className={`tracking-btn tracking-btn-sm ${currentViewMode === 'workflow' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => handleViewModeChange('workflow')}
              title="Workflow view"
            >
              <i className="fas fa-sitemap"></i>
              Workflow
            </button>
            <button
              className={`tracking-btn tracking-btn-sm ${currentViewMode === 'table' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => handleViewModeChange('table')}
              title="Table view"
            >
              <i className="fas fa-table"></i>
              Table
            </button>
          </div>

          {/* Personal Views */}
          <div className="tracking-personal-views" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`tracking-btn tracking-btn-sm ${currentViewMode === 'my-initiated' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => handleShowMyData('initiated')}
              title="View my initiated trackings"
            >
              <i className="fas fa-user-plus"></i>
              My Initiated
            </button>
            <button
              className={`tracking-btn tracking-btn-sm ${currentViewMode === 'my-assigned' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => handleShowMyData('assigned')}
              title="View my assigned trackings"
            >
              <i className="fas fa-user-check"></i>
              My Assigned
            </button>
          </div>

          {/* Action Buttons */}
          <div className="tracking-action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="tracking-btn tracking-btn-outline tracking-btn-sm"
              onClick={onRefresh}
              title="Refresh tracking data"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
            
            <button
              className="tracking-btn tracking-btn-outline tracking-btn-sm"
              onClick={handleShowBySchool}
              title="View trackings by school"
            >
              <i className="fas fa-university"></i>
              By School
            </button>

            {/* Export Options */}
            <div className="tracking-export-dropdown" style={{ position: 'relative' }}>
              <button 
                className="tracking-btn tracking-btn-secondary tracking-btn-sm"
                onClick={() => setShowActions(!showActions)}
                title="Export options"
              >
                <i className="fas fa-download"></i>
                Export
                <i className={`fas fa-chevron-${showActions ? 'up' : 'down'}`} style={{ marginLeft: '0.25rem' }}></i>
              </button>
              
              {showActions && (
                <div className="tracking-export-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'var(--tracking-bg-card)',
                  border: '1px solid var(--tracking-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--tracking-shadow-lg)',
                  zIndex: 1000,
                  minWidth: '150px',
                  marginTop: '0.25rem'
                }}>
                  <button
                    className="tracking-export-option"
                    onClick={() => handleExport('json')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <i className="fas fa-file-code"></i>
                    Export JSON
                  </button>
                  <button
                    className="tracking-export-option"
                    onClick={() => handleExport('csv')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <i className="fas fa-file-csv"></i>
                    Export CSV
                  </button>
                  <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--tracking-border)' }} />
                  <button
                    className="tracking-export-option"
                    onClick={() => window.print()}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <i className="fas fa-print"></i>
                    Print Report
                  </button>
                </div>
              )}
            </div>
            
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

     

     
      {showActions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default TrackingHeader;