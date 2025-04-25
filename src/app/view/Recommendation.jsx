import React, { useState, useEffect } from "react";
import { getFromAPI } from "@/app/data/auxFunctions";

const Recommendation = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const data = await getFromAPI("recommendation");
        setRecommendation(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching recommendation:", err);
        setError("Failed to load recommendation");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  if (loading) {
    return (
      <div className="recommendation-card loading">
        <div className="recommendation-header">
          <h3>AI Recommendation</h3>
          <div className="loading-spinner"></div>
        </div>
        <p>Loading recommendation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-card error">
        <div className="recommendation-header">
          <h3>AI Recommendation</h3>
        </div>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="recommendation-card empty">
        <div className="recommendation-header">
          <h3>AI Recommendation</h3>
        </div>
        <p>No recommendations available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <h3>AI Recommendation</h3>
        <span className="recommendation-badge">New</span>
      </div>
      <div className="recommendation-content">
        <div className="recommendation-task">
          <h4>{recommendation.title}</h4>
          <p>{recommendation.description}</p>
        </div>
        <div className="recommendation-details">
          <div className="recommendation-detail">
            <span className="label">Module:</span>
            <span className="value">{recommendation.moduleId}</span>
          </div>
          <div className="recommendation-detail">
            <span className="label">Story Points:</span>
            <span className="value">{recommendation.story_Points}</span>
          </div>
          <div className="recommendation-detail">
            <span className="label">Estimated Time:</span>
            <span className="value">{recommendation.estimatedTime} hours</span>
          </div>
          <div className="recommendation-detail">
            <span className="label">Priority:</span>
            <span
              className={`priority-badge priority-${
                recommendation.story_Points >= 7
                  ? "high"
                  : recommendation.story_Points >= 4
                  ? "medium"
                  : "low"
              }`}
            >
              {recommendation.story_Points >= 7
                ? "High"
                : recommendation.story_Points >= 4
                ? "Medium"
                : "Low"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
