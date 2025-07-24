import React, { useState, useEffect } from 'react';
import './NotesModal.css';

const NotesModal = ({ curriculum, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteType, setNoteType] = useState('general');

  const currentStage = curriculum.selectedStage || curriculum.currentStage;
  const stageTitle = currentStage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentStageData = curriculum.stages[currentStage];

  useEffect(() => {
   
    if (currentStageData?.notes) {
      setNotes(currentStageData.notes);
    }
  }, [currentStageData]);

  const noteTypes = [
    { 
      value: 'general', 
      label: 'General Notes', 
      icon: 'fas fa-sticky-note',
      description: 'General observations and comments about this stage'
    },
    { 
      value: 'feedback', 
      label: 'Feedback', 
      icon: 'fas fa-comments',
      description: 'Feedback for the submitter or next stage reviewer'
    },
    { 
      value: 'concerns', 
      label: 'Concerns', 
      icon: 'fas fa-exclamation-triangle',
      description: 'Issues or concerns that need to be addressed'
    },
    { 
      value: 'recommendations', 
      label: 'Recommendations', 
      icon: 'fas fa-lightbulb',
      description: 'Suggestions for improvement or next steps'
    }
  ];

  const predefinedComments = {
    dean_committee: [
      'Curriculum aligns well with academic standards and institutional goals.',
      'Minor adjustments needed in course sequencing and prerequisites.',
      'Additional faculty resources may be required for implementation.',
      'Market demand analysis supports the introduction of this program.',
      'Cross-departmental coordination recommended for shared courses.'
    ],
    senate: [
      'Academic rigor and standards are appropriately maintained.',
      'Program structure supports student learning outcomes effectively.',
      'Assessment methods are comprehensive and well-designed.',
      'Integration with existing programs has been adequately addressed.',
      'Quality assurance mechanisms are properly established.'
    ],
    qa_review: [
      'Documentation meets institutional quality standards.',
      'Learning outcomes are clearly defined and measurable.',
      'Resource allocation is adequate for program delivery.',
      'Compliance with regulatory requirements confirmed.',
      'Regular review and update mechanisms are in place.'
    ]
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      alert('Please enter some notes before saving.');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 
      onSave(notes.trim());
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const insertPredefinedComment = (comment) => {
    const textarea = document.getElementById('notes-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = notes;
    
    const newText = currentText.substring(0, start) + comment + currentText.substring(end);
    setNotes(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + comment.length, start + comment.length);
    }, 0);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-sticky-note"></i>
            Add Notes - {stageTitle}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="tracking-modal-body">
          {/* Curriculum Info */}
          <div className="tracking-notes-info tracking-notes-info-section">
            <div className="tracking-notes-info-content">
              <i className="fas fa-book"></i>
              <div className="tracking-notes-curriculum-details">
                <div className="tracking-notes-curriculum-title">{curriculum.title}</div>
                <div className="tracking-notes-curriculum-meta">
                  {curriculum.trackingId} • {curriculum.school} • {curriculum.department}
                </div>
              </div>
            </div>
          </div>

          {/* Note Type Selection */}
          <div className="tracking-note-type-selection tracking-note-type-section">
            <h5 className="tracking-note-type-title">Note Type</h5>
            <div className="tracking-note-type-grid">
              {noteTypes.map(type => (
                <div
                  key={type.value}
                  className={`tracking-note-type-option ${noteType === type.value ? 'selected' : ''}`}
                  onClick={() => setNoteType(type.value)}
                >
                  <div className="tracking-note-type-header">
                    <i className={type.icon}></i>
                    <span className="tracking-note-type-label">{type.label}</span>
                  </div>
                  <div className="tracking-note-type-description">
                    {type.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Notes Display */}
          {currentStageData?.notes && (
            <div className="tracking-existing-notes tracking-existing-notes-section">
              <h5 className="tracking-existing-notes-title">
                <i className="fas fa-history"></i>
                Current Notes
              </h5>
              <div className="tracking-existing-notes-content">
                {currentStageData.notes}
              </div>
              <div className="tracking-existing-notes-timestamp">
                Last updated: {formatDateTime(currentStageData.updatedAt || Date.now())}
              </div>
            </div>
          )}

          {/* Predefined Comments */}
          {predefinedComments[currentStage] && (
            <div className="tracking-predefined-comments tracking-predefined-comments-section">
              <h5 className="tracking-predefined-comments-title">
                <i className="fas fa-list"></i>
                Quick Comments
              </h5>
              <div className="tracking-comments-grid">
                {predefinedComments[currentStage].map((comment, index) => (
                  <button
                    key={index}
                    className="tracking-predefined-comment"
                    onClick={() => insertPredefinedComment(comment)}
                  >
                    <i className="fas fa-plus"></i>
                    {comment}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Textarea */}
          <div className="tracking-notes-input tracking-notes-input-section">
            <h5 className="tracking-notes-input-title">
              <i className="fas fa-edit"></i>
              {currentStageData?.notes ? 'Update Notes' : 'Add Notes'}
            </h5>
            <div className="tracking-form-group">
              <textarea
                id="notes-textarea"
                className="tracking-form-control"
                rows="8"
                placeholder={`Add your ${noteType} for the ${stageTitle} stage...`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="tracking-notes-meta">
                <span className="tracking-notes-character-count">
                  {notes.length} characters
                </span>
                <span className="tracking-notes-keyboard-hint">
                  Use Ctrl+Enter to save quickly
                </span>
              </div>
            </div>
          </div>

          {/* Note Guidelines */}
          <div className="tracking-note-guidelines">
            <h5 className="tracking-note-guidelines-title">
              <i className="fas fa-info-circle"></i>
              Guidelines
            </h5>
            <div className="tracking-note-guidelines-content">
              <ul className="tracking-note-guidelines-list">
                <li>Be specific and constructive in your feedback</li>
                <li>Include actionable recommendations where applicable</li>
                <li>Reference specific sections or requirements if needed</li>
                <li>Maintain professional and respectful tone</li>
                <li>Consider the impact on subsequent stages</li>
              </ul>
            </div>
          </div>

          {/* Note History */}
          {currentStageData?.noteHistory && currentStageData.noteHistory.length > 0 && (
            <div className="tracking-note-history tracking-note-history-section">
              <h5 className="tracking-note-history-title">
                <i className="fas fa-clock"></i>
                Note History
              </h5>
              <div className="tracking-history-list">
                {currentStageData.noteHistory.map((entry, index) => (
                  <div key={index} className="tracking-history-item">
                    <div className="tracking-history-header">
                      <span className="tracking-history-author">{entry.author}</span>
                      <span className="tracking-history-timestamp">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <div className="tracking-history-content">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="tracking-modal-footer">
          <button 
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          
          <button 
            className="tracking-btn tracking-btn-secondary"
            onClick={() => setNotes('')}
            disabled={saving || !notes.trim()}
          >
            <i className="fas fa-eraser"></i>
            Clear
          </button>
          
          <button 
            className="tracking-btn tracking-btn-primary"
            onClick={handleSave}
            disabled={!notes.trim() || saving}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner tracking-btn-loading"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {currentStageData?.notes ? 'Update Notes' : 'Save Notes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;