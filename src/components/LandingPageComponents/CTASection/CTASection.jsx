import React from 'react';
import './CTASection.css'
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {


  const navigate = useNavigate()
  const handleCTAClick = (e) => {
    e.preventDefault();
    const button = e.currentTarget;
    const originalHTML = button.innerHTML;

    
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Dashboard...';
    button.style.pointerEvents = 'none';
    
    setTimeout(() => {
      navigate('/app')
      
      button.innerHTML = originalHTML;
      button.style.pointerEvents = 'auto';
    }, 1500);
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-description">
          Access your personalized curriculum management dashboard and experience 
          the future of academic administration at MUST.
        </p>
        <button className="cta-button" onClick={handleCTAClick}>
          <i className="fas fa-arrow-right"></i>
          Access CurricFlow Dashboard
        </button>
      </div>
    </section>
  );
};