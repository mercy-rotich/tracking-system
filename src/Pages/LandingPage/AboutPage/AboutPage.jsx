import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPageHeader from '../../../components/LandingPageComponents/LandingPageHeader/LandingPageHeader';
import { LandingPageFooter } from '../../../components/LandingPageComponents/LandingPageFooter/LandingPageFooter';
import './AboutPage.css';

const AboutPage = () => {
  const [animatedSections, setAnimatedSections] = useState(new Set());
  const sectionsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.dataset.section;
            setAnimatedSections(prev => new Set([...prev, sectionId]));
            
            const elements = entry.target.querySelectorAll('.feature-item, .team-member, .process-step');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animate');
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const handleCTAClick = (e) => {
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

  const featuresData = [
    {
      icon: 'fas fa-route',
      title: 'Linear Workflow Management',
      description: 'Streamlined step-by-step curriculum approval process with automated routing and progress tracking.'
    },
    {
      icon: 'fas fa-users-cog',
      title: 'Role-Based Access Control',
      description: 'Secure permissions system ensuring appropriate access levels for different stakeholders in the process.'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Comprehensive Analytics',
      description: 'Detailed insights and reporting capabilities to monitor curriculum performance and approval metrics.'
    }
  ];

  const processSteps = [
    {
      number: 1,
      title: 'Department Submission',
      description: 'Departments create and submit new curricula through our intuitive interface with comprehensive documentation support.'
    },
    {
      number: 2,
      title: 'Multi-Level Review',
      description: 'Systematic review process through School Board, Dean Committee, Senate, and Quality Assurance with automated notifications.'
    },
    {
      number: 3,
      title: 'External Validation',
      description: 'Commission of University Education (CUE) external review and site inspection for final accreditation approval.'
    }
  ];

  const teamMembers = [
    {
      icon: 'fas fa-user-graduate',
      name: 'Academic Committee',
      role: 'Curriculum Review',
      description: 'Expert faculty ensuring academic excellence and standards compliance.'
    },
    {
      icon: 'fas fa-shield-alt',
      name: 'Quality Assurance',
      role: 'System Administration',
      description: 'Monitoring progress, managing workflows, and ensuring quality standards.'
    },
    {
      icon: 'fas fa-cogs',
      name: 'Technical Support',
      role: 'System Maintenance',
      description: 'Providing technical assistance and maintaining system performance.'
    },
    {
      icon: 'fas fa-graduation-cap',
      name: 'University Leadership',
      role: 'Strategic Oversight',
      description: 'Guiding institutional direction and curriculum development strategy.'
    }
  ];

  return (
    <div className="about-page">
      <LandingPageHeader />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-hero-badge">
            <i className="fas fa-university"></i>
            About CurricFlow
          </div>
          <h1 className="about-hero-title">
            Revolutionizing Curriculum Management
          </h1>
          <p className="about-hero-subtitle">
            Our comprehensive digital platform transforms how Meru University of Science & Technology 
            manages curriculum development, approval processes, and academic excellence through 
            innovative technology solutions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-grid">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                To provide Meru University of Science & Technology with a cutting-edge curriculum 
                tracking system that streamlines academic processes, enhances transparency, and 
                ensures compliance with educational standards.
              </p>
              <p>
                We believe that efficient curriculum management is fundamental to academic excellence. 
                Our system eliminates bureaucratic bottlenecks, reduces processing time, and provides 
                real-time visibility into the approval workflow.
              </p>
            </div>
            <div className="mission-visual">
              <div className="mission-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Excellence in Education</h3>
              <p>
                Empowering academic institutions with tools that foster innovation, 
                collaboration, and continuous improvement in curriculum development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-overview" ref={addToRefs} data-section="features">
        <div className="features-overview-container">
          <h2>Key Capabilities</h2>
          <p className="features-overview-subtitle">
            Discover the powerful features that make curriculum management efficient and transparent
          </p>
          <div className="features-grid">
            {featuresData.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section" ref={addToRefs} data-section="process">
        <div className="process-container">
          <h2>How It Works</h2>
          <p className="process-subtitle">
            Our streamlined approach ensures efficient curriculum approval from submission to accreditation
          </p>
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="process-number">{step.number}</div>
                <div className="process-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" ref={addToRefs} data-section="team">
        <div className="team-container">
          <h2>Our Stakeholders</h2>
          <p className="team-subtitle">
            Meet the dedicated teams that make curriculum excellence possible
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="team-avatar">
                  <i className={member.icon}></i>
                </div>
                <h3>{member.name}</h3>
                <div className="team-role">{member.role}</div>
                <p>{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-cta-container">
          <h2>Ready to Experience CurricFlow?</h2>
          <p>
            Join us in transforming curriculum management at MUST. Access your dashboard 
            and start streamlining your academic processes today.
          </p>
          <button className="about-cta-button" onClick={handleCTAClick}>
            <i className="fas fa-arrow-right"></i>
            Access Dashboard
          </button>
        </div>
      </section>

      <LandingPageFooter />
    </div>
  );
};

export default AboutPage;