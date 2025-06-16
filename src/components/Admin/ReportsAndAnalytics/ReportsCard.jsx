import React, { useState } from 'react';

const ReportsCard = ({ icon, title, description, statNumber, statLabel, iconColor, onView, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    onExport(title);
  };

  return (
    <div className="report-card">
      <div className="report-card-header">
        <div className={`report-icon report-${iconColor}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="report-info">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="report-stats">
        <div>
          <div className="report-stat-number">{statNumber}</div>
          <div className="report-stat-label">{statLabel}</div>
        </div>
      </div>
      <div className="report-actions">
        <button className="report-btn report-btn-primary report-btn-small" onClick={() => onView(title)}>
          <i className="fas fa-eye"></i>
          View Report
        </button>
        <button 
          className="report-btn report-btn-outline report-btn-small" 
          onClick={handleExport}
          disabled={isExporting}
        >
          <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
};

export default ReportsCard;
