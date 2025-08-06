import React from 'react';

const StatsCard = ({ icon, title, value, isLoading }) => {
  if (isLoading) {
    return (
      <div className="stat-card loading">
        <div className="loading-placeholder"></div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="stat-value">{value || 0}</p>
    </div>
  );
};

export default StatsCard;
