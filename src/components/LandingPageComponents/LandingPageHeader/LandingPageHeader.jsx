import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo_image from '../../../assets/logo.jpg'
import './LandingPageHeader.css'

const LandingPageHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnWhiteSection, setIsOnWhiteSection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroSection = document.getElementById('heroSection');
      
      setIsScrolled(scrollY > 100);
      
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setIsOnWhiteSection(scrollY + 100 >= heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardClick = (e) => {
    e.preventDefault();
    const button = e.currentTarget;
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Dashboard...';
    button.style.pointerEvents = 'none';
    
    setTimeout(() => {
      navigate('/app/dashboard');
      
      
      button.innerHTML = originalHTML;
      button.style.pointerEvents = 'auto';
    }, 1500);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header 
      className={`landing-header ${isOnWhiteSection ? 'landing-on-white-section' : ''}`}
      style={{
        boxShadow: isScrolled ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
      }}
    >
      <div className="landing-header-container">
        <div className="landing-logo-container">
          <div className="landing-logo-img">
            <img src={logo_image} alt="school logo" />
          </div>
          <div className="landing-brand-info">
            <h1>Curriculum Tracking System</h1>
            <p>Meru University of Science & Technology</p>
          </div>
        </div>
        
        <nav className="landing-nav-menu">
          <button 
            className="landing-nav-link" 
            onClick={() => scrollToSection('about')}
          >
            About
          </button>
          <button 
            className="landing-nav-link" 
            onClick={() => scrollToSection('academics')}
          >
            Academics
          </button>
          <button 
            className="landing-nav-link" 
            onClick={() => scrollToSection('research')}
          >
            Research
          </button>
          <button 
            className="landing-nav-link" 
            onClick={() => scrollToSection('services')}
          >
            Services
          </button>
          <button 
            className="landing-dashboard-btn"
            onClick={handleDashboardClick}
          >
            <i className="fas fa-tachometer-alt"></i>
            Access Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
};

export default LandingPageHeader;