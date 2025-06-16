import React from 'react';
import ReportsCard from './ReportsCard';

const ReportsGrid = ({ onViewReport, onExportReport }) => {
  const reportsData = [
    {
      icon: 'fa-clipboard-list',
      title: 'Curriculum Status Report',
      description: 'Complete overview of all curriculum statuses',
      statNumber: '127',
      statLabel: 'Total Records',
      iconColor: 'green'
    },
    {
      icon: 'fa-university',
      title: 'School Performance',
      description: 'Performance metrics by school/faculty',
      statNumber: '8',
      statLabel: 'Schools Tracked',
      iconColor: 'blue'
    },
    {
      icon: 'fa-clock',
      title: 'Approval Timeline',
      description: 'Time analysis for approval processes',
      statNumber: '45',
      statLabel: 'Avg Days',
      iconColor: 'gold'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Quality Assurance',
      description: 'QA review metrics and compliance',
      statNumber: '98%',
      statLabel: 'Compliance Rate',
      iconColor: 'red'
    },
    {
      icon: 'fa-paper-plane',
      title: 'CUE Submissions',
      description: 'External submission tracking and outcomes',
      statNumber: '23',
      statLabel: 'Submitted',
      iconColor: 'purple'
    },
    {
      icon: 'fa-exclamation-triangle',
      title: 'Bottleneck Analysis',
      description: 'Workflow delays and improvement areas',
      statNumber: '5',
      statLabel: 'Issues Found',
      iconColor: 'orange'
    }
  ];

  return (
    <div className="report-grid">
      {reportsData.map((report, index) => (
        <ReportsCard
          key={index}
          {...report}
          onView={onViewReport}
          onExport={onExportReport}
        />
      ))}
    </div>
  );
};

export default ReportsGrid;