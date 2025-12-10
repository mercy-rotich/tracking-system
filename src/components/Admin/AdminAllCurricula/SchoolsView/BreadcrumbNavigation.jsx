import React from 'react';

const BreadcrumbNavigation = ({ path }) => {
  if (!path || path.length === 0) return null;

  return (
    <div className="curricula-breadcrumb">
      {path.map((item, index) => (
        <React.Fragment key={index}>
          {item.action ? (
            <button
              onClick={item.action}
              className="curricula-breadcrumb-link"
            >
              {item.label}
            </button>
          ) : (
            <span className="curricula-breadcrumb-current">{item.label}</span>
          )}
          {index < path.length - 1 && (
            <i className="fas fa-chevron-right curricula-breadcrumb-separator"></i>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbNavigation;
