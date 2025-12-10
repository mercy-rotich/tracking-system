import React, { useState } from 'react';
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

      {/* Table View  */}
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
          {/* Curriculum Selection */}
          <div className="tracking-curriculum-selector">
            <div className="tracking-selector-header">
              <h3>
                <i className="fas fa-book"></i>
                Select Curriculum to Track
              </h3>
              <div className="tracking-selector-count">
                {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''}
              </div>
              </div>
            
            <div className="tracking-curriculum-cards">
              {curricula.map(curriculum => (
                <div
                  key={curriculum.id}
                  className={`tracking-curriculum-card ${
                    selectedCurriculum?.id === curriculum.id ? 'tracking-curriculum-card-active' : ''
                  }`}
                  onClick={() => setSelectedCurriculum(curriculum)}
                >
                  <div className="tracking-curriculum-card-header">
                    <div className="tracking-curriculum-card-title">
                      {curriculum.title}
                    </div>
                    <div className="tracking-curriculum-card-id">
                      {curriculum.trackingId}
                    </div>
                  </div>
                  
                  <div className="tracking-curriculum-card-meta">
                    <div className="tracking-curriculum-card-school">
                      <i className="fas fa-university"></i>
                      {curriculum.school || 'Unknown School'}
                    </div>
                    {curriculum.priority && (
                      <div className="tracking-curriculum-card-priority">
                        <i className={`fas fa-flag tracking-priority-${curriculum.priority}`}></i>
                        {curriculum.priority.charAt(0).toUpperCase() + curriculum.priority.slice(1)} Priority
                      </div>
                    )}
                  </div>
                  
                  <div className="tracking-curriculum-card-status">
                    {curriculum.status && (
                      <span className={`tracking-status-badge tracking-status-${curriculum.status.replace('_', '-')}`}>
                        {curriculum.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                    <div className="tracking-curriculum-card-stage">
                      Current: {curriculum.currentStage 
                        ? (stages.find(s => s.key === curriculum.currentStage)?.title || 'Unknown Stage')
                        : 'Not Started'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           {/* Selected Curriculum Workflow */}
          {(selectedCurriculum || curricula[0]) && (
            <div className="tracking-active-workflow">
              {/* Workflow Header */}
              <div className="tracking-workflow-header">
                <div className="tracking-workflow-title">
                  <h2>{(selectedCurriculum || curricula[0]).title}</h2>
                  <div className="tracking-workflow-subtitle">
                    {(selectedCurriculum || curricula[0]).school} • {(selectedCurriculum || curricula[0]).department}
                  </div>
                </div>
                
                <div className="tracking-workflow-actions">
                  <button 
                    className="tracking-btn tracking-btn-outline"
                    onClick={() => onViewDetails(selectedCurriculum || curricula[0])}
                  >
                    <i className="fas fa-eye"></i>
                    View Full Details
                  </button>
                  <button className="tracking-btn tracking-btn-secondary">
                    <i className="fas fa-download"></i>
                    Export Report
                  </button>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="tracking-progress-overview">
                <div className="tracking-progress-stats">
                  <div className="tracking-progress-stat">
                    <div className="tracking-progress-value">
                      {stages.findIndex(s => s.key === (selectedCurriculum || curricula[0]).currentStage) + 1}
                    </div>
                    <div className="tracking-progress-label">Current Stage</div>
                  </div>
                  <div className="tracking-progress-stat">
                    <div className="tracking-progress-value">
                      {(selectedCurriculum || curricula[0]).totalDays}
                    </div>
                    <div className="tracking-progress-label">Days Total</div>
                  </div>
                  <div className="tracking-progress-stat">
                    <div className="tracking-progress-value">
                      {(selectedCurriculum || curricula[0]).daysInCurrentStage}
                    </div>
                    <div className="tracking-progress-label">Days in Stage</div>
                  </div>
                </div>
                
                <div className="tracking-progress-bar-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ 
                        width: `${((stages.findIndex(s => s.key === (selectedCurriculum || curricula[0]).currentStage) + 1) / stages.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    {Math.round(((stages.findIndex(s => s.key === (selectedCurriculum || curricula[0]).currentStage) + 1) / stages.length) * 100)}% Complete
                  </div>
                </div>
              </div>

              {/* Workflow Stages */}
              <div className="tracking-workflow-stages">
                <div className="tracking-stages-header">
                  <h3>
                    <i className="fas fa-route"></i>
                    Approval Workflow
                  </h3>
                  <div className="tracking-workflow-legend">
                    <div className="tracking-legend-item">
                      <div className="tracking-legend-dot tracking-legend-completed"></div>
                      <span>Completed</span>
                    </div>
                    <div className="tracking-legend-item">
                      <div className="tracking-legend-dot tracking-legend-current"></div>
                      <span>Current</span>
                    </div>
                    <div className="tracking-legend-item">
                      <div className="tracking-legend-dot tracking-legend-pending"></div>
                      <span>Pending</span>
                    </div>
                    <div className="tracking-legend-item">
                      <div className="tracking-legend-dot tracking-legend-hold"></div>
                      <span>On Hold</span>
                    </div>
                  </div>
                </div>
                
                <div className="tracking-stages-grid">
                  {stages.map((stage, index) => (
                    <WorkflowStage
                      key={stage.key}
                      stage={stage}
                      curriculum={selectedCurriculum || curricula[0]}
                      stageData={(selectedCurriculum || curricula[0]).stages[stage.key]}
                      isActive={(selectedCurriculum || curricula[0]).currentStage === stage.key}
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
            