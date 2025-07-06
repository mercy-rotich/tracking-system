import React, { useEffect, useRef } from 'react';
import { NewsCard } from './NewsCard';
import './NewsSection.css'

 const NewsSection = () => {
  const sectionRef = useRef(null);

  const newsData = [
    {
      id: 1,
      icon: 'fas fa-calendar-alt',
      title: 'New Curriculum Approval Workflow Launched',
      excerpt: 'Enhanced digital approval process reduces processing time by 60% and provides real-time tracking capabilities.',
      date: 'December 15, 2024'
    },
    {
      id: 2,
      icon: 'fas fa-chart-line',
      title: 'Advanced Analytics Dashboard Released',
      excerpt: 'New comprehensive analytics provide insights into curriculum performance and departmental activities.',
      date: 'December 10, 2024'
    },
    {
      id: 3,
      icon: 'fas fa-award',
      title: 'MUST Achieves 95% Curriculum Approval Rate',
      excerpt: 'Outstanding achievement in academic excellence with streamlined curriculum management processes.',
      date: 'December 5, 2024'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.news-card');
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
    <section className="news-section" id="newsSection" ref={sectionRef}>
      <div className="news-container">
        <div className="section-header">
          <h2 className="section-title">Latest Updates</h2>
          <p className="section-subtitle">
            Stay informed about curriculum management improvements and academic developments
          </p>
        </div>
        
        <div className="news-grid">
          {newsData.map((news) => (
            <NewsCard 
              key={news.id} 
              {...news} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;