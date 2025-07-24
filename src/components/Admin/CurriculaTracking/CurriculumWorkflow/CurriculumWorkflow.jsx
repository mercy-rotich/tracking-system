
import React from 'react';
import WorkflowStage from '../WorkflowStage/WorkflowStage';
import './CurriculumWorkflow.css';

const CurriculumWorkflow = ({ 
  curricula, 
  onStageAction, 
  onViewDetails, 
  onUploadDocument, 
  onAddNotes, 
  isLoading 
}) => {
  const stages = [
    {
      key: 'initiation',
      title: 'Initiation',
      description: 'Department submits curriculum proposal',
      icon: 'fas fa-lightbulb'
    },
    {
      key: 'school_board',
      title: 'School Board',
      description: 'Review for duplicates and initial approval',
      icon: 'fas fa-users'
    },
    {
      key: 'dean_committee',
      title: 'Dean Committee',
      description: 'Academic alignment and standards review',
      icon: 'fas fa-user-tie'
    },
    {
      key: 'senate',
      title: 'Senate',
      description: 'Academic senate approval',
      icon: 'fas fa-landmark'
    },
    {
      key: 'qa_review',
      title: 'QA Review',
      description: 'Quality assurance evaluation',
      icon: 'fas fa-clipboard-check'
    },
    {
      key: 'vice_chancellor',
      title: 'Vice Chancellor',
      description: 'Executive approval and CUE submission',
      icon: 'fas fa-stamp'
    },
    {
      key: 'cue_review',
      title: 'CUE Review',
      description: 'External commission evaluation',
      icon: 'fas fa-university'
    },
    {
      key: 'site_inspection',
      title: 'Site Inspection',
      description: 'Final inspection and accreditation',
      icon: 'fas fa-search'
    }
  ];

  if (isLoading) {
    return (
      <div className="tracking-workflow-loading tracking-card">
        <div className="tracking-card-body">
          <i className="fas fa-spinner tracking-icon tracking-btn-loading" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p>Loading workflow data...</p>
        </div>
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="tracking-workflow-empty tracking-card">
        <div className="tracking-card-body">
          <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--tracking-text-muted)', marginBottom: '1rem' }}></i>
          <h3>No Curricula Found</h3>
          <p style={{ color: 'var(--tracking-text-secondary)' }}>
            No curricula match your current filters or there are no curricula in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-workflow">
      <div className="tracking-card">
        <div className="tracking-card-header">
          <h3 className="tracking-section-title">
            <i className="fas fa-sitemap tracking-icon"></i>
            Curriculum Workflow
          </h3>
          <div className="tracking-workflow-legend">
            <div className="tracking-flex">
              <div className="tracking-status-dot tracking-status-dot-pending"></div>
              <span>Pending</span>
            </div>
            <div className="tracking-flex">
              <div className="tracking-status-dot tracking-status-dot-active"></div>
              <span>Active</span>
            </div>
            <div className="tracking-flex">
              <div className="tracking-status-dot tracking-status-dot-completed"></div>
              <span>Completed</span>
            </div>
            <div className="tracking-flex">
              <div className="tracking-status-dot tracking-status-dot-hold"></div>
              <span>On Hold</span>
            </div>
            <div className="tracking-flex">
              <div className="tracking-status-dot tracking-status-dot-rejected"></div>
              <span>Rejected</span>
            </div>
          </div>
        </div>
        
        <div className="tracking-card-body">
          {/* Workflow Stages Header */}
          <div className="tracking-workflow-stages-header">
            <div className="tracking-grid" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: '1rem' }}>
              {stages.map((stage, index) => (
                <div key={stage.key} className="tracking-workflow-stage-header">
                  <div className="tracking-workflow-stage-number">
                    <span className="tracking-badge tracking-badge-secondary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="tracking-workflow-stage-icon">
                    <i className={stage.icon} style={{ fontSize: '1.25rem', color: 'var(--tracking-primary)' }}></i>
                  </div>
                  <h4 className="tracking-workflow-stage-title">
                    {stage.title}
                  </h4>
                  <p className="tracking-workflow-stage-description">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Workflows */}
          <div className="tracking-curriculum-workflows">
            {curricula.map(curriculum => (
              <div key={curriculum.id} className="tracking-curriculum-workflow">
                {/* Curriculum Header */}
                <div className="tracking-curriculum-header tracking-card">
                  <div className="tracking-card-body">
                    <div className="tracking-flex tracking-items-center tracking-justify-between">
                      <div className="tracking-curriculum-info">
                        <h4 className="tracking-curriculum-title">
                          {curriculum.title}
                        </h4>
                        <div className="tracking-curriculum-meta">
                          <span className="tracking-badge tracking-badge-neutral">
                            <i className="fas fa-hashtag"></i>
                            {curriculum.trackingId}
                          </span>
                          <span>
                            <i className="fas fa-building"></i>
                            {curriculum.school}
                          </span>
                          <span>
                            <i className="fas fa-users"></i>
                            {curriculum.department}
                          </span>
                          <span className={`tracking-priority tracking-priority-${curriculum.priority}`}>
                            <i className="fas fa-flag"></i>
                            {curriculum.priority.charAt(0).toUpperCase() + curriculum.priority.slice(1)} Priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="tracking-curriculum-actions">
                        <button
                          className="tracking-btn tracking-btn-outline tracking-btn-sm"
                          onClick={() => onViewDetails(curriculum)}
                        >
                          <i className="fas fa-eye"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="tracking-curriculum-progress">
                      <div className="tracking-flex tracking-justify-between">
                        <span>
                          Progress: {curriculum.currentStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span>
                          {curriculum.totalDays} days total
                        </span>
                      </div>
                      <div className="tracking-progress-bar">
                        <div 
                          className="tracking-progress-fill" 
                          style={{ 
                            width: `${(stages.findIndex(s => s.key === curriculum.currentStage) + 1) / stages.length * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Stages */}
                <div className="tracking-workflow-stages">
                  <div className="tracking-grid" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: '0.5rem' }}>
                    {stages.map(stage => (
                      <WorkflowStage
                        key={stage.key}
                        stage={stage}
                        curriculum={curriculum}
                        stageData={curriculum.stages[stage.key]}
                        isActive={curriculum.currentStage === stage.key}
                        onStageAction={onStageAction}
                        onViewDetails={onViewDetails}
                        onUploadDocument={onUploadDocument}
                        onAddNotes={onAddNotes}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumWorkflow;