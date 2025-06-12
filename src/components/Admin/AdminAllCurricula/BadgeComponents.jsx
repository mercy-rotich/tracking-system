import React from 'react';

export const getStatusBadge = (status) => {
  const statusConfig = {
    approved: { class: 'status-approved', icon: 'fa-check-circle', text: 'Approved' },
    pending: { class: 'status-pending', icon: 'fa-clock', text: 'Pending Review' },
    draft: { class: 'status-draft', icon: 'fa-edit', text: 'Draft' },
    rejected: { class: 'status-rejected', icon: 'fa-times-circle', text: 'Rejected' }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`status-badge ${config.class}`}>
      <i className={`fas ${config.icon}`}></i>
      {config.text}
    </span>
  );
};

export const getDifficultyBadge = (difficulty) => {
  const difficultyConfig = {
    Beginner: { class: 'difficulty-beginner', color: '#00BF63' },
    Intermediate: { class: 'difficulty-intermediate', color: '#f0b41c' },
    Advanced: { class: 'difficulty-advanced', color: '#1a3a6e' }
  };
  
  const config = difficultyConfig[difficulty] || difficultyConfig.Beginner;
  return (
    <span className={`difficulty-badge ${config.class}`} style={{ backgroundColor: config.color }}>
      {difficulty}
    </span>
  );
};