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

