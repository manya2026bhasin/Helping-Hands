import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/donorDashboard.css";
import { jwtDecode } from 'jwt-decode';
import bloodDropImage from "../images/blood-drop.png";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:5000");
function DonorDashboard() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [donorBloodGroup, setDonorBloodGroup] = useState('');

    function getEmailFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.email;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }

    const fetchDonorBloodGroup = async () => {
        const email = getEmailFromToken();
        console.log("email",email);
        if (!email) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/donors?email=${email}`);
            if (response.data && response.data.donor.bloodGroup) {
                setDonorBloodGroup(response.data.donor.bloodGroup);
            }
        } catch (error) {
            console.error('Error fetching donor blood group:', error);
        }
    };

    useEffect(() => {
        socket.on("receive_message", (data) => {
        fetchDonorBloodGroup();
        if(donorBloodGroup === data.form.bloodGroup){
            setNotifications((prevNotifications) => [...prevNotifications, data.form]);
        }
        });

        // Clean up the event listener on component unmount
        return () => {
            socket.off("receive_message");
        };
    }, []);

    const openLocationInMaps = (latitude, longitude) => {
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
    };

    const toggleNotificationPanel = (e) => {
        setShowNotificationPanel(!showNotificationPanel);
    }

    return (
        <div>
            <div className="header">
                <div className="logo-container">
                    <img src={bloodDropImage}></img>
                    <div className="logo"><span>Helping</span>Hands</div>
                </div>
                <div className="icons">
                    {notifications.length > 0 && (
                        <span className="notification-badge">{notifications.length}</span>
                    )}
                    <i className="fa-solid fa-bell" onClick={toggleNotificationPanel}></i>

                    <i class="fa-solid fa-user"></i>
                </div>
            </div>
            <div className="side-bar">
                <div><i class="fa-solid fa-house"></i><br></br>Home</div>
                <div><i class="fa-solid fa-heart-pulse"></i><br></br>Health status</div>
                <div><i class="fa-solid fa-gift"></i><br></br>Rewards</div>
                <div><i class="fa-solid fa-droplet"></i><br></br>Donation History</div>
                <div><i class="fa-solid fa-book"></i><br></br>Resources and Guidelines</div>
            </div>
            {/* Notification Section */}
            {showNotificationPanel && <div className="notification-section">
                {notifications.length > 0 ? (
                    <div>
                        {notifications.map((notification, index) => (
                            <div key={index}>
                                <p><strong>Patient Name:</strong> {notification.pname}</p>
                                <p><strong>Age:</strong> {notification.age}</p>
                                <p><strong>Blood Group:</strong> {notification.bloodGroup}</p>

                                <button
                                    onClick={() => openLocationInMaps(notification.latitude, notification.longitude)}
                                    className="location-button"
                                >
                                    View on Google Maps
                                </button>
                                <button className="available-button">Available</button>
                                <button className="not-available-button">Not available</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No new notifications</p>
                )}
            </div>
            }
        </div>
    );
}
export default DonorDashboard;