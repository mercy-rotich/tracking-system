import React, { useState, useEffect, useRef } from 'react';
import { ImageCarousel } from '../ImageCarousel/ImageCarousel';
import './LandingPageHero.css' 
import { useNavigate } from 'react-router-dom';
import { useCurriculum } from '../../../context/CurriculumContext'; //

export const LandingPageHero = () => {
  const { data, loading } = useCurriculum(); 
  const navigate = useNavigate();
  
  const [counters, setCounters] = useState({
    curricula: 0,
    schools: 0,
    programs: 0,
    departments: 0
  });
  
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

 
  const statsData = [
    { 
      key: 'curricula', 
      target: data?.totalCurricula || 0, 
      icon: 'fas fa-book-open', 
      label: 'Total Curricula' 
    },
    { 
      key: 'schools', 
      target: data?.totalSchools || 0, 
      icon: 'fas fa-building', 
      label: 'Academic Schools' 
    },
    { 
      key: 'programs', 
     
      target: data?.totalPrograms || 3, 
      icon: 'fas fa-graduation-cap', 
      label: 'Academic Levels' 
    },
    { 
      key: 'departments', 
      target: data?.totalDepartments || 0, 
      icon: 'fas fa-users', 
      label: 'Departments' 
    }
  ];

  const animateCounter = (key, target, duration = 2000) => {
    // Prevent animation if target is invalid or 0 (unless genuinely 0)
    if (target === undefined || target === null) return;

    let start = counters[key]; 
    const startTime = performance.now();
    
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const current = Math.floor(start + (target - start) * easedProgress);
      setCounters(prev => ({ ...prev, [key]: current }));
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCounters(prev => ({ ...prev, [key]: target }));
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  // Initial Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            statsData.forEach((stat, index) => {
              setTimeout(() => {
                animateCounter(stat.key, stat.target);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

 
  useEffect(() => {
    if (hasAnimated && !loading) {
      statsData.forEach((stat) => {
       
        if (counters[stat.key] !== stat.target) {
            animateCounter(stat.key, stat.target, 1000); 
        }
      });
    }
  }, [data, hasAnimated, loading]);

  const handleMainCTA = (e) => {
    e.preventDefault();
    const button = e.currentTarget;
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Dashboard...';
    button.style.pointerEvents = 'none';
    
    setTimeout(() => {
      navigate('/app/dashboard')
      button.innerHTML = originalHTML;
      button.style.pointerEvents = 'auto';
    }, 1500);
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('featuresSection');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="landing-hero" id="heroSection">
      <div className="landing-hero-container">
        <div className="landing-hero-content">
          <div className="landing-welcome-badge">
            <i className="fas fa-star"></i>
            Welcome to Curriculum Management System
          </div>
          
          <h1 className="landing-hero-title">
            Advanced Curriculum Management System
          </h1>
          
          <p className="landing-hero-subtitle">
            Streamline your academic curriculum management with our comprehensive digital platform. 
            Designed specifically for academic excellence, featuring intelligent tracking, 
            seamless approvals, and detailed analytics.
          </p>
          
          <div className="landing-hero-cta">
            <button className="landing-cta-primary" onClick={handleMainCTA}>
              <i className="fas fa-rocket"></i>
              Launch Dashboard
            </button>
            <button className="landing-cta-secondary" onClick={scrollToFeatures}>
              <i className="fas fa-info-circle"></i>
              Learn More
            </button>
          </div>

          <div className="landing-hero-stats" ref={statsRef}>
            {statsData.map((stat, index) => (
              <div 
                key={stat.key} 
                className="landing-hero-stat-item"
                style={{ '--delay': index }}
              >
                <div className="landing-stat-icon">
                  <i className={stat.icon}></i>
                </div>
                <span className="landing-hero-stat-number">
                  {/* Show spinner if loading and value is still 0, otherwise show number */}
                  {loading && counters[stat.key] === 0 ? (
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '0.5em' }}></i>
                  ) : (
                      counters[stat.key]
                  )}
                </span>
                <span className="landing-hero-stat-label">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="landing-hero-visual">
          <ImageCarousel />
        </div>
      </div>
    </section>
  );
};