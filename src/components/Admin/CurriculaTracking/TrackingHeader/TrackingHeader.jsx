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
  onShowByDepartment,
  onShowByAssignee,
  onShowByInitiator,
  onExportData,
  trackingStats 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showAdvancedViews, setShowAdvancedViews] = useState(false);
  const [selectedIdentifier, setSelectedIdentifier] = useState('');

  const handleViewModeChange = (mode) => {
    if (onViewMode) {
      onViewMode(mode);
    }
  };

  const handleExport = (format) => {
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

  const handleShowByDepartment = () => {
    const departmentId = prompt('Enter Department ID:');
    if (departmentId && onShowByDepartment) {
      onShowByDepartment(departmentId);
    }
  };

  const handleShowByAssignee = () => {
    const assigneeId = prompt('Enter Assignee ID:');
    if (assigneeId && onShowByAssignee) {
      onShowByAssignee(assigneeId);
    }
  };

  const handleShowByInitiator = () => {
    const initiatorId = prompt('Enter Initiator ID:');
    if (initiatorId && onShowByInitiator) {
      onShowByInitiator(initiatorId);
    }
  };

  const getViewModeDisplayName = (mode) => {
    const modeNames = {
      'all': 'All Trackings',
      'my-initiated': 'My Initiated',
      'my-assigned': 'My Assigned',
      'by-school': 'By School',
      'by-department': 'By Department',
      'by-assignee': 'By Assignee',
      'by-initiator': 'By Initiator',
      'by-stage': 'By Stage',
      'workflow': 'Workflow View',
      'table': 'Table View'
    };
    return modeNames[mode] || mode;
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
          
          {/* Current View Indicator */}
          <div style={{ 
            marginTop: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--tracking-text-secondary)'
          }}>
            <i className="fas fa-eye"></i>
            <span>Current View: <strong>{getViewModeDisplayName(currentViewMode)}</strong></span>
            {trackingStats?.total && (
              <span>• {trackingStats.total} total trackings</span>
            )}
          </div>
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

          {/*  Filter Views */}
          <div className="tracking-filter-views" style={{ position: 'relative' }}>
            <button 
              className="tracking-btn tracking-btn-secondary tracking-btn-sm"
              onClick={() => setShowAdvancedViews(!showAdvancedViews)}
              title="Advanced filtering options"
            >
              <i className="fas fa-filter"></i>
              Filter Views
              <i className={`fas fa-chevron-${showAdvancedViews ? 'up' : 'down'}`} style={{ marginLeft: '0.25rem' }}></i>
            </button>
            
            {showAdvancedViews && (
              <div className="tracking-advanced-views-menu" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'var(--tracking-bg-card)',
                border: '1px solid var(--tracking-border)',
                borderRadius: '8px',
                boxShadow: 'var(--tracking-shadow-lg)',
                zIndex: 1000,
                minWidth: '200px',
                marginTop: '0.25rem'
              }}>
                <div style={{ padding: '0.5rem 0' }}>
                  <button
                    className="tracking-filter-option"
                    onClick={handleShowBySchool}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--tracking-text-primary)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--tracking-bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-university"></i>
                    Filter by School
                  </button>
                  
                  <button
                    className="tracking-filter-option"
                    onClick={handleShowByDepartment}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--tracking-text-primary)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--tracking-bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-building"></i>
                    Filter by Department
                  </button>
                  
                  <button
                    className="tracking-filter-option"
                    onClick={handleShowByAssignee}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--tracking-text-primary)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--tracking-bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-user-tag"></i>
                    Filter by Assignee
                  </button>
                  
                  <button
                    className="tracking-filter-option"
                    onClick={handleShowByInitiator}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--tracking-text-primary)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--tracking-bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-user-edit"></i>
                    Filter by Initiator
                  </button>
                </div>
              </div>
            )}
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

      {/*  Stats Summary Bar */}
      {trackingStats && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--tracking-bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--tracking-border)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', color: 'var(--tracking-secondary)', fontSize: '1.25rem' }}>
                {trackingStats.myAssigned || 0}
              </div>
              <div style={{ color: 'var(--tracking-text-secondary)' }}>My Assigned</div>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdowns when clicking outside */}
      {(showActions || showAdvancedViews) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowActions(false);
            setShowAdvancedViews(false);
          }}
        />
      )}
    </div>
  );
};

export default TrackingHeader;