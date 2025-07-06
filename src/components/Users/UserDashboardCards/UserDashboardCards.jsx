
import React from 'react';
import './UserDashboardCards.css';

const UserDashboardCards = ({ totalCurricula, totalSchools, totalPrograms, totalDepartments }) => {
  const cards = [
    {
      id: 'curricula',
      icon: 'fas fa-book-open',
      value: totalCurricula,
      label: 'Total Curricula',
      trend: '+12 this month',
      trendIcon: 'fas fa-arrow-up',
      gradient: 'user-gradient-green'
    },
    {
      id: 'schools',
      icon: 'fas fa-building',
      value: totalSchools,
      label: 'Academic Schools',
      trend: 'All active',
      trendIcon: 'fas fa-check',
      gradient: 'user-gradient-gold'
    },
    {
      id: 'programs',
      icon: 'fas fa-graduation-cap',
      value: totalPrograms,
      label: 'Academic Levels',
      trend: '',
      trendIcon: '',
      gradient: 'user-gradient-blue'
    },
    {
      id: 'departments',
      icon: 'fas fa-sitemap',
      value: totalDepartments,
      label: 'Departments',
      trend: 'High activity',
      trendIcon: 'fas fa-star',
      gradient: 'user-gradient-purple'
    }
  ];

  return (
    <section className="user-dashboard-cards">
      {cards.map((card, index) => (
        <div 
          key={card.id} 
          className="user-dashboard-card user-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="user-card-header">
            <div className={`user-card-icon user-card-icon--${card.gradient}`}>
              <i className={card.icon} />
            </div>
          </div>
          <div className="user-card-value">{card.value}</div>
          <div className="user-card-label">{card.label}</div>
          <div className="user-card-trend">
            <i className={card.trendIcon} />
            {card.trend}
          </div>
        </div>
      ))}
    </section>
  );
};

export default UserDashboardCards;