import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo_image from '../../../assets/logo.jpg'
import './LandingPageHeader.css'

const LandingPageHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnWhiteSection, setIsOnWhiteSection] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleAboutClick = (e) => {
    e.preventDefault();
    const button = e.currentTarget;
    const originalHTML = button.innerHTML;
    

    if (location.pathname === '/about') {
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
   
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.style.pointerEvents = 'none';
    
    setTimeout(() => {
      navigate('/about');
      
     
      button.innerHTML = originalHTML;
      button.style.pointerEvents = 'auto';
    }, 800);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    
    
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAboutClickMobile = (e) => {
    e.preventDefault();
    closeMobileMenu();
    handleAboutClick(e);
  };

  const handleDashboardClickMobile = (e) => {
    e.preventDefault();
    closeMobileMenu();
    handleDashboardClick(e);
  };

  return (
    <header 
      className={`landing-header ${isOnWhiteSection ? 'landing-on-white-section' : ''}`}
      style={{
        boxShadow: isScrolled ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
      }}
    >
      <div className="landing-header-container">
        <div className="landing-logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="landing-logo-img">
            <img src={logo_image} alt="school logo" />
          </div>
          <div className="landing-brand-info">
            <h1>Curriculum Tracking System</h1>
            <p>Meru University of Science & Technology</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="landing-nav-menu">
          <button 
            className="landing-nav-link" 
            onClick={handleAboutClick}
          >
            About
          </button>
          
          <button 
            className="landing-dashboard-btn"
            onClick={handleDashboardClick}
          >
            <i className="fas fa-tachometer-alt"></i>
            Access Dashboard
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`landing-mobile-menu-btn md:hidden ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            <div className="landing-mobile-menu-overlay" onClick={closeMobileMenu}></div>
            <nav className="landing-mobile-nav">
              <div className="landing-mobile-nav-content">
                <button 
                  className="landing-mobile-nav-link" 
                  onClick={handleAboutClickMobile}
                >
                  <i className="fas fa-info-circle"></i>
                  About
                </button>
                
                <button 
                  className="landing-mobile-dashboard-btn"
                  onClick={handleDashboardClickMobile}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  Access Dashboard
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default LandingPageHeader;