import React from 'react';
import logo_image from '../../../assets/logo.jpg'
import './LandingPageFooter.css'
export const LandingPageFooter = () => {
  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Help Center', href: '#' }
  ];

  const handleLinkClick = (e) => {
    e.preventDefault();
    
    console.log('Navigate to:', e.target.textContent);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <div className="logo-img">
            <img src={logo_image} alt="school logo" />
          </div>
          <div>
            <h3>CurricFlow</h3>
            <p>Curriculum Management System</p>
          </div>
        </div>
        
        <p className="footer-text">
          Empowering academic excellence through innovative curriculum management 
          solutions at Meru University of Science & Technology.
        </p>
        
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href} 
              className="footer-link"
              onClick={handleLinkClick}
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Meru University of Science & Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};