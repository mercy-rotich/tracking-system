import React, { useEffect, useRef } from 'react';
import './FeaturesSection.css'

export const FeaturesSection = () => {
  const sectionRef = useRef(null);

  const featuresData = [
    {
      id: 1,
      icon: 'fas fa-search',
      title: 'Smart Search & Filtering',
      description: 'Advanced search capabilities allow you to find any curriculum quickly. Filter by school, department, program type, or approval status with intuitive controls.'
    },
    {
      id: 2,
      icon: 'fas fa-tasks',
      title: 'Streamlined Approval Process',
      description: 'Automated workflow management with real-time notifications, approval tracking, and comprehensive audit trails for complete transparency.'
    },
    {
      id: 3,
      icon: 'fas fa-chart-pie',
      title: 'Comprehensive Analytics',
      description: 'Detailed reports and interactive dashboards provide insights into curriculum trends, approval rates, and departmental performance metrics.'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate');
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" id="featuresSection" ref={sectionRef}>
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">System Features</h2>
          <p className="section-subtitle">
            Powerful tools designed to enhance your curriculum management experience
          </p>
        </div>
        
        <div className="features-grid">
          {featuresData.map((feature, index) => (
            <div key={feature.id} className="feature-card fade-in">
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};