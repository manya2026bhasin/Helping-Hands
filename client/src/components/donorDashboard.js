import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/donorDashboard.css";
import { jwtDecode } from 'jwt-decode';
import bloodDropImage from "../images/blood-drop.png";
import axios from "axios";
import socket from "./socket";
import Resources from "./resources";
import HealthStatus from "./healthStatus";
import DonationHistory from "./donationHistory";
import DonorHome from "./donorHome.js";
import Rewards from "./rewards";
import API_BASE_URL from "../apiconfig.js";

function DonorDashboard() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [activeFeature, setActiveFeature] = useState('home');
    const [donorBloodGroup, setDonorBloodGroup] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'Home':
                return <DonorHome getEmailFromToken={getEmailFromToken} />;
            case 'Health Status':
                return <HealthStatus getEmailFromToken={getEmailFromToken} />;
            case 'Rewards':
                return <Rewards getEmailFromToken={getEmailFromToken} />
            case 'Donation History':
                return <DonationHistory getEmailFromToken={getEmailFromToken} />
            case 'Resources and Guidelines':
                return <Resources getEmailFromToken={getEmailFromToken} />
            default:
                return <DonorHome getEmailFromToken={getEmailFromToken} />;
        }
    };

    const fetchDonorBloodGroup = async () => {
        const email = getEmailFromToken();
        console.log("email", email);
        if (!email) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/donors?email=${email}`);
            if (response.data && response.data.donor.bloodGroup) {
                setDonorBloodGroup(response.data.donor.bloodGroup);
                console.log(response.data.donor.bloodGroup);
                console.log(donorBloodGroup);
            }
        } catch (error) {
            console.error('Error fetching donor blood group:', error);
        }
    };

    const fetchNotificationDetails = async () => {
        const email = getEmailFromToken();
        if (!email) return;

        try {
            // Fetch notifications
            const response = await axios.get(`${API_BASE_URL}/api/donors/notifications?email=${email}`);
            if (response.data && response.data.notifications) {
                // Fetch details for each notification
                const detailedNotifications = await Promise.all(
                    response.data.notifications.map(async (notification) => {
                        try {
                            const patientResponse = await axios.get(`${API_BASE_URL}/api/patients/${notification.patientId}`);
                            console.log("patient response: ", patientResponse.data);
                            return {
                                ...notification,
                                ...patientResponse.data, // Merge patient details into the notification
                            };
                        } catch (error) {
                            console.error(`Error fetching details for patientId ${notification.patientId}:`, error);
                            return { ...notification, error: "Failed to fetch details" };
                        }
                    })
                );

                setNotifications(detailedNotifications);
                console.log("notifications:", notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotificationDetails();
    }, []);

    useEffect(() => {
        const initializeSocket = async () => {
            socket.on("receive_message", async (data) => {
                console.log("Message received:", data);

                const newNotification = {
                    patientId: data.patientId,
                    bloodGroup: data.form.bloodGroup,
                    timestamp: new Date().toISOString(),
                    status: "unread", // Default status
                };

                // Save notification to backend
                try {
                    const response = await axios.post(`${API_BASE_URL}/api/donors/notifications`, newNotification);
                    if (response.status === 201) {
                        console.log("Notification saved to backend:", response.data);
                        fetchNotificationDetails(); // Refresh notifications
                    } else {
                        console.error("Failed to save notification:", response);
                    }
                } catch (error) {
                    console.error("Error posting notification to backend:", error);
                }
            });
        };

        initializeSocket();

        return () => {
            socket.off("receive_message");
        };
    }, []);

    const toggleSidebar = (e) => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const openLocationInMaps = (latitude, longitude) => {
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
    };

    const toggleNotificationPanel = (e) => {
        setShowNotificationPanel(!showNotificationPanel);
    };

    const handleAvailableButton = (patientId) => {
        const email = getEmailFromToken();
        socket.emit("donor_available", { email, patientId });
    };

    const deleteNotification = async (patientId) => {
        const email = getEmailFromToken();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/donors/deletenotifications`, { email, patientId });
            if (response.status === 201) {
                console.log("Notification deleted:", response.data);
                fetchNotificationDetails(); // Refresh notifications
            } else {
                console.error("Failed to delete notification:", response);
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

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

                    <i class="fa fa-bars hamburger-menu" onClick={toggleSidebar}></i>
                </div>
            </div>
            <div className={`side-bar ${isSidebarOpen ? '' : 'hide-sidebar'}`}>
                <div onClick={() => setActiveFeature('Home')}><i className="fa-solid fa-house"></i><br></br>Home</div>
                <div onClick={() => setActiveFeature('Health Status')}><i className="fa-solid fa-heart-pulse"></i><br></br>Health status</div>
                <div onClick={() => setActiveFeature('Rewards')}><i className="fa-solid fa-gift"></i><br></br>Rewards</div>
                <div onClick={() => setActiveFeature('Donation History')}><i className="fa-solid fa-droplet"></i><br></br>Donation History</div>
                <div onClick={() => setActiveFeature('Resources and Guidelines')}><i className="fa-solid fa-book"></i><br></br>Resources and Guidelines</div>
            </div>
            <div className="dashboard-content">
                {renderFeatureContent()}
            </div>
            {/* Notification Section */}
            {showNotificationPanel && <div className="notification-section">
                {notifications.length > 0 ? (
                    <div>
                        {notifications.map((notification, index) => (
                            <div key={index}>
                                <p><strong>Patient Name:</strong> {notification.fullname || "Unknown"}</p>
                                <p><strong>Blood Group:</strong> {notification.bloodGroup || "N/A"}</p>
                                <p><strong>Contact no.:</strong> {notification.contactInfo.phone || "N/A"}</p>

                                <div className="notification-buttons">
                                <button className="available-button" onClick={() => handleAvailableButton(notification.serialId)}>Available</button>
                                <button className="not-available-button" onClick={() => deleteNotification(notification.serialId)}>Not available</button>
                                <button
                                    onClick={() => openLocationInMaps(notification.location.latitude, notification.location.longitude)}
                                    className="location-button"
                                >
                                    View Location
                                </button>
                                </div>
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