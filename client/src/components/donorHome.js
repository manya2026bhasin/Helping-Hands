import React, {useEffect, useState} from "react";
import axios from "axios";
import "../styles/donorHome.css";

const DonorHome = ({getEmailFromToken}) => {
    const [lives, setLives] = useState(0);
    const email = getEmailFromToken();
    useEffect(() => {
        
        const fetchLives = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/donors/points/${email}`);
                setLives((response.data.data)/50);
            } catch (error) {
                console.error("Error fetching lives saved:", error);
            }
        };
        fetchLives();
    }, [email]);
    return (
        <div className="donor-home-container">
            <section className="welcome-banner">
                <h1>Welcome to the Donor Platform!</h1>
                <p>Join hands to save lives and make a difference in the world.</p>
            </section>

            <section className="features-section">
                <h2>Explore Our Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Rewards 🎉</h3>
                        <p>Earn badges and points for every successful donation.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Donation History 🩸</h3>
                        <p>Track your past contributions and impact.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Health Status 💝</h3>
                        <p>Monitor your health metrics and eligibility.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Resources and Guidelines 📑</h3>
                        <p>Join blood donation drives near you.</p>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <h2>Your Impact</h2>
                <p>You have saved <strong>{lives} lives</strong>.</p>
            </section>

            </div>
    );
};

export default DonorHome;
