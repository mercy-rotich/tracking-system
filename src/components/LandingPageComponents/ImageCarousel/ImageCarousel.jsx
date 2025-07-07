import React, { useState, useEffect, useRef } from 'react';
import must_campus from '../../../assets/image1.jpg'
import image_4 from '../../../assets/image3.jpeg'
import image_2 from '../../../assets/image2.jpg'
import library_image from '../../../assets/library.jpg'
import laboratory_image from '../../../assets/multi-specialty-laboratory.jpg'
import student_image from '../../../assets/student-center.jpg'
import '../LandingPageHero/LandingPageHero.css'

export const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const autoScrollInterval = 4000;
  const progressInterval = useRef(null);
  const autoScrollTimer = useRef(null);

  const images = [
    {
      src: must_campus,
      title: "MUST Main Campus",
      description: "Excellence in Education & Technology - Our state-of-the-art facilities provide world-class learning environments."
    },
    {
      src: library_image,
      title: "Modern Library & Learning Center",
      description: "Advanced digital resources and collaborative spaces designed for 21st-century academic excellence."
    },
    {
      src: laboratory_image,
      title: "Cutting-Edge Science Laboratories",
      description: "Equipped with the latest technology to support innovative research and hands-on learning experiences."
    },
    {
      src: student_image,
      title: "Vibrant Student Center",
      description: "A hub for student activities, collaboration, and community building across all academic disciplines."
    },
    {
      src: image_4 ,
      title: "Innovation & Technology Hub",
      description: "Fostering technological advancement and entrepreneurship in science and technology fields."
    }
  ];

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    goToSlide(nextIndex);
  };

  const startAutoScroll = () => {
    if (isPaused) return;
    
    autoScrollTimer.current = setTimeout(() => {
      nextSlide();
    }, autoScrollInterval);
  };

  const startProgressBar = () => {
    if (isPaused) return;
    
    const increment = 100 / (autoScrollInterval / 50); 
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(progressInterval.current);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  };

  const resetTimers = () => {
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setProgress(0);
  };

  const pauseCarousel = () => {
    setIsPaused(true);
    resetTimers();
  };

  const resumeCarousel = () => {
    setIsPaused(false);
    resetTimers();
    startAutoScroll();
    startProgressBar();
  };

  useEffect(() => {
    startAutoScroll();
    startProgressBar();
    
    return () => resetTimers();
  }, [currentIndex, isPaused]);

  const handleDotClick = (index) => {
    goToSlide(index);
    resetTimers();
    if (!isPaused) {
      startAutoScroll();
      startProgressBar();
    }
  };

  const currentImage = images[currentIndex];

  return (
    <div 
      className="landing-hero-image"
      onMouseEnter={pauseCarousel}
      onMouseLeave={resumeCarousel}
    >
      <div className="landing-main-image">
        <img 
          src={currentImage.src} 
          alt={currentImage.title}
          style={{ 
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </div>
      
      <div className="landing-carousel-controls">
        <div 
          className="landing-progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
        
        <div className="landing-image-info">
          <div className="landing-image-title">{currentImage.title}</div>
          <div className="landing-image-description">{currentImage.description}</div>
        </div>
        
        <div className="landing-carousel-nav">
          {images.map((_, index) => (
            <button
              key={index}
              className={`landing-carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};