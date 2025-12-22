import React, { useState, useEffect, useRef } from 'react';
import WorkflowStage from '../WorkflowStage/WorkflowStage';
import TrackingTable from '../TrackingTable/TrackingTable';
import './CurriculumWorkflow.css';

const CurriculumWorkflow = ({ 
  curricula, 
  onStageAction, 
  onViewDetails, 
  onUploadDocument, 
  onAddNotes, 
  isLoading,
  onEditTracking,     
  onAssignTracking,    
  onToggleStatus       
}) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [viewMode, setViewMode] = useState('workflow');
  const workflowRef = useRef(null);
  
  const stages = [
    {
      key: 'initiation',
      title: 'Initiation',
      description: 'Department submits curriculum proposal',
      icon: 'fas fa-lightbulb',
      color: '#3b82f6'
    },
    {
      key: 'school_board',
      title: 'School Board',
      description: 'Review for duplicates and initial approval',
      icon: 'fas fa-users',
      color: '#8b5cf6'
    },
    {
      key: 'dean_committee',
      title: 'Dean Committee',
      description: 'Academic alignment and standards review',
      icon: 'fas fa-user-tie',
      color: '#06b6d4'
    },
    {
      key: 'senate',
      title: 'Senate',
      description: 'Academic senate approval',
      icon: 'fas fa-landmark',
      color: '#10b981'
    },
    {
      key: 'qa_review',
      title: 'QA Review',
      description: 'Quality assurance evaluation',
      icon: 'fas fa-clipboard-check',
      color: '#f59e0b'
    },
    {
      key: 'vice_chancellor',
      title: 'Vice Chancellor',
      description: 'Executive approval and CUE submission',
      icon: 'fas fa-stamp',
      color: '#ef4444'
    },
    {
      key: 'cue_review',
      title: 'CUE Review',
      description: 'External commission evaluation',
      icon: 'fas fa-university',
      color: '#6366f1'
    },
    {
      key: 'site_inspection',
      title: 'Site Inspection',
      description: 'Final inspection and accreditation',
      icon: 'fas fa-search',
      color: '#84cc16'
    }
  ];

  // Auto-select first curriculum or persist selection
  useEffect(() => {
    if (!selectedCurriculum && curricula.length > 0) {
      setSelectedCurriculum(curricula[0]);
    }
  }, [curricula, selectedCurriculum]);

  // Handle review button click - scroll to workflow
  const handleReviewClick = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setViewMode('workflow');
    
    // Scroll to workflow after a brief delay to ensure render
    setTimeout(() => {
      if (workflowRef.current) {
        workflowRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="tracking-workflow-loading">
        <div className="tracking-workflow-loading-content">
          <div className="tracking-loading-spinner">
            <i className="fas fa-spinner tracking-spin"></i>
          </div>
          <h3>Loading Workflow Data</h3>
          <p>Please wait while we fetch the latest curriculum information...</p>
        </div>
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="tracking-workflow-empty">
        <div className="tracking-empty-icon">
          <i className="fas fa-route"></i>
        </div>
        <h3>No Curricula Found</h3>
        <p>No curricula match your current filters or there are no curricula in the system.</p>
        <button className="tracking-btn tracking-btn-primary">
          <i className="fas fa-plus"></i>
          Add New Curriculum
        </button>
      </div>
    );
  }

  const currentCurriculum = selectedCurriculum || curricula[0];

  // Calculate items needing action
  const needsActionItems = curricula.filter(c => 
    c.stages?.[c.currentStage]?.status === 'under_review'
  );

  return (
    <div className="tracking-workflow">
      {/* View Mode Toggle */}
      <div className="tracking-workflow-controls">
        <div className="tracking-view-mode-toggle">
          <button
            className={`tracking-btn tracking-btn-sm ${viewMode === 'workflow' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
            onClick={() => setViewMode('workflow')}
          >
            <i className="fas fa-sitemap"></i>
            Workflow View
          </button>
          <button
            className={`tracking-btn tracking-btn-sm ${viewMode === 'table' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
            onClick={() => setViewMode('table')}
          >
            <i className="fas fa-table"></i>
            Table View
          </button>
        </div>
        
        <div className="tracking-curricula-count">
          {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <TrackingTable
          curricula={curricula}
          onStageAction={onStageAction}
          onViewDetails={onViewDetails}
          isLoading={isLoading}
          onEditTracking={onEditTracking}      
          onAssignTracking={onAssignTracking}  
          onToggleStatus={onToggleStatus}      
        />
      )}

      {/* Workflow View */}
      {viewMode === 'workflow' && (
        <>
          {/* Quick Actions Panel - Items Needing Action */}
          {needsActionItems.length > 0 && (
            <div className="tracking-quick-actions-panel">
              <div className="tracking-quick-actions-header">
                <div className="tracking-quick-actions-title">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{needsActionItems.length} Item{needsActionItems.length !== 1 ? 's' : ''} Requiring Your Approval</span>
                </div>
              </div>
              
              <div className="tracking-quick-actions-list">
                {needsActionItems.map(item => (
                  <div
                    key={item.id}
                    className={`tracking-quick-action-item ${currentCurriculum?.id === item.id ? 'tracking-quick-action-active' : ''}`}
                    onClick={() => handleReviewClick(item)}
                  >
                    <div className="tracking-quick-action-info">
                      <div className="tracking-quick-action-title">{item.title}</div>
                      <div className="tracking-quick-action-meta">
                        <span className="tracking-quick-action-stage">
                          {stages.find(s => s.key === item.currentStage)?.title || item.currentStage}
                        </span>
                        <span className="tracking-quick-action-separator">•</span>
                        <span className={`tracking-quick-action-days ${
                          item.daysInCurrentStage > 7 ? 'tracking-days-warning' : 
                          item.daysInCurrentStage > 14 ? 'tracking-days-danger' : ''
                        }`}>
                          <i className="fas fa-clock"></i>
                          {item.daysInCurrentStage} day{item.daysInCurrentStage !== 1 ? 's' : ''} in stage
                        </span>
                      </div>
                    </div>
                    <button 
                      className="tracking-quick-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewClick(item);
                      }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Map - Visual Overview */}
          <div className="tracking-progress-map">
            <div className="tracking-progress-map-header">
              <h3>Workflow Progress Overview</h3>
            </div>
            
            <div className="tracking-progress-map-timeline">
              {stages.map((stage, idx) => {
                const stageIndex = stages.findIndex(s => s.key === currentCurriculum.currentStage);
                const isCompleted = idx < stageIndex;
                const isCurrent = idx === stageIndex;
                const isPending = idx > stageIndex;

                return (
                  <React.Fragment key={stage.key}>
                    <div 
                      className={`tracking-progress-step ${
                        isCompleted ? 'tracking-progress-step-completed' : 
                        isCurrent ? 'tracking-progress-step-current' : 
                        'tracking-progress-step-pending'
                      }`}
                      title={stage.title}
                    >
                      {isCurrent && <div className="tracking-progress-step-pulse" />}
                    </div>
                    {idx < stages.length - 1 && (
                      <div className="tracking-progress-connector" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="tracking-progress-map-stats">
              <div className="tracking-progress-map-stat">
                <span className="tracking-progress-map-stat-value">
                  {stages.findIndex(s => s.key === currentCurriculum.currentStage) + 1}
                </span>
                <span className="tracking-progress-map-stat-label">of {stages.length} stages</span>
              </div>
              <div className="tracking-progress-map-stat">
                <span className="tracking-progress-map-stat-value">
                  {Math.round(((stages.findIndex(s => s.key === currentCurriculum.currentStage) + 1) / stages.length) * 100)}%
                </span>
                <span className="tracking-progress-map-stat-label">complete</span>
              </div>
            </div>
          </div>

          {/* Selected Curriculum Workflow */}
          {currentCurriculum && (
            <div className="tracking-active-workflow" ref={workflowRef}>
              <div className="tracking-workflow-header">
                <div className="tracking-workflow-title-section">
                  <h2 className="tracking-workflow-title">{currentCurriculum.title}</h2>
                  <div className="tracking-workflow-subtitle">
                    <span className="tracking-workflow-id">{currentCurriculum.trackingId}</span>
                    <span className="tracking-workflow-separator">•</span>
                    <span className="tracking-workflow-school">
                      <i className="fas fa-university"></i>
                      {currentCurriculum.school || 'Unknown School'}
                    </span>
                  </div>
                </div>
              </div>

              

              {/* Workflow Stages */}
              <div className="tracking-workflow-stages">
                <div className="tracking-stages-grid">
                  {stages.map((stage, index) => (
                    <WorkflowStage
                      key={stage.key}
                      stage={stage}
                      curriculum={currentCurriculum}
                      stageData={currentCurriculum.stages?.[stage.key]}
                      isActive={currentCurriculum.currentStage === stage.key}
                      stageNumber={index + 1}
                      onStageAction={onStageAction}
                      onViewDetails={onViewDetails}
                      onUploadDocument={onUploadDocument}
                      onAddNotes={onAddNotes}
                      onEditTracking={onEditTracking}     
                      onAssignTracking={onAssignTracking} 
                      onToggleStatus={onToggleStatus}     
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CurriculumWorkflow;