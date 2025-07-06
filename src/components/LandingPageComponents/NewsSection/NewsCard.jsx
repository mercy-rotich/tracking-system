import React from 'react';

export const NewsCard = ({ icon, title, excerpt, date, image }) => {
  return (
    <div className="news-card fade-in">
      <div className="news-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="news-image-placeholder">
            <i className={icon}></i>
          </div>
        )}
      </div>
      
      <div className="news-content">
        <h3 className="news-title">{title}</h3>
        <p className="news-excerpt">{excerpt}</p>
        <div className="news-date">{date}</div>
      </div>
    </div>
  );
};