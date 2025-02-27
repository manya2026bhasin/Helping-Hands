import React, { useState, useEffect } from 'react';
import bronzeBadge from "../images/bronze-donor.png";
import silverBadge from "../images/silver-donor.png";
import goldBadge from "../images/gold-donor.png";
import axios from 'axios';
import '../styles/rewards.css';
import API_BASE_URL from '../apiconfig';

const Rewards = ({getEmailFromToken}) => {
  const email = getEmailFromToken();
  const [totalPoints, setTotalPoints] = useState(400); // Replace with actual points logic from backend
  const [badges] = useState([
    { name: "Bronze Donor", pointsRequired: 100, image: bronzeBadge },
    { name: "Silver Donor", pointsRequired: 500, image: silverBadge },
    { name: "Gold Donor", pointsRequired: 1000, image: goldBadge },
  ]);

  const [rewards] = useState([
    { pointsRequired: 500, reward: "Free Health Screening" },
    { pointsRequired: 1000, reward: "Exclusive Donor T-shirt" },
  ]);

  useEffect(() => {

    const fetchPoints = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/donors/points/${email}`);
            setTotalPoints(response.data.data);
        } catch (error) {
            console.error("Error fetching donor's points:", error);
        }
    };
    fetchPoints();
}, [email]);

  const handleClaimReward = (reward) => {
    alert(`You have claimed: ${reward}`);
    // Handle backend integration for claiming the reward
  };

  const earnedBadge = badges.filter(badge => totalPoints >= badge.pointsRequired).pop();

  return (
    <div className="rewards-container">
      <h2>Your Rewards</h2>

      {/* Points Display Section */}
      <div className="points-display">
        <p>Total Points: <span className="points-count">{totalPoints}</span></p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${(totalPoints / 2000) * 100}%`, maxWidth: '100%' }} // Adjust max points if needed
          ></div>
        </div>
        <p>Points needed for next reward: {Math.max(0, 500 - totalPoints)}</p>
      </div>

      {/* Badge System */}
      <div className="badge-section">
        <h3>Your Badge</h3>
        <div className="all-badges-section">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`badge ${totalPoints >= badge.pointsRequired ? 'earned-badge' : 'non-earned-badge'}`}
            >
              <p><strong>{badge.name}</strong></p>
              <p>Earned at {badge.pointsRequired} Points</p>
              {badge.image && <img src={badge.image} alt={`${badge.name} badge`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Rewards List Section */}
      <h3>Available Rewards</h3>
      <div className="reward-list">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className={`reward-item ${totalPoints >= reward.pointsRequired ? 'available' : 'unavailable'}`}
          >
            <p>{reward.reward}</p>
            <p><strong>{reward.pointsRequired} Points</strong></p>
            <button
              onClick={() => handleClaimReward(reward.reward)}
              disabled={totalPoints < reward.pointsRequired}
              className="claim-button"
            >
              {totalPoints >= reward.pointsRequired ? 'Claim Reward' : 'Not Enough Points'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;
