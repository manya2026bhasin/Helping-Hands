import React, { useState } from "react";
import bloodDropImage from "../images/blood-drop.png";
import { useNavigate } from 'react-router-dom';
import "../styles/home.css";
function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="header">
                <div className="logo-container">
                    <img src={bloodDropImage}></img>
                    <div className="logo"><span>Helping</span>Hands</div>
                </div>
                <div className="links">
                    <p>Home</p>
                    <p>About Us</p>
                    <p onClick={() => navigate('/login-form')}>Login</p>
                </div>
            </div>
            <div className="hero">
                <div className="home-background"></div>
                <div className="centre-card">
                    <h2>Find Blood Donors Nearby</h2>
                    <p>Your one-stop solution to connect with blood donors in your area.</p>
                    <div className="centre-card-buttons">
                        <button className="find-donor-btn" onClick={() => navigate('/find-donor-form')}>Find Donors</button>
                        <button className="become-donor-btn" onClick={() => navigate('/become-donor-form')}>Become a Donor</button>
                    </div>
                </div>
            </div>
            <div className="footer"></div>
        </div>
    );
}
export default Home;