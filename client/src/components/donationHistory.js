import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/donationHistory.css";
import bloodDropImage from "../images/blood-drop.png";
import API_BASE_URL from "../apiconfig";
import heartHands from "../images/heart-hands.png";

function DonationHistory({ getEmailFromToken }) {
    const [history, setHistory] = useState([]);
    const email = getEmailFromToken();


    useEffect(() => {

        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/donors/history/${email}`);
                setHistory(response.data.data);
                console.log(history);
            } catch (error) {
                console.error("Error fetching donation history:", error);
            }
        };
        fetchHistory();
    }, [email]);

    return (

        <div className="donation-history-container">
            <div class="donation-history-header">
                <div class="blood-drops">
                    <span class="blood-drop"><img src={heartHands}></img></span>
                    <h1>Donation History</h1>
                </div>
                <p class="sub-heading">Your timeline of life-saving contributions</p>
                <hr class="header-line" />
            </div>

            {history.length > 0 ? (
                <div>
                    <div className="timeline">
                        {history.map((record, index) => (
                            <div
                                key={record._id}
                                className={`timeline-card ${index % 2 === 0 ? "left" : "right"}`}
                            >
                                <div className="card-content">
                                    <div className="date">{new Date(record.donationDate).toDateString()}</div>
                                    <div className="patient-name">
                                        <span className="label">Donated to: </span> {record.recipientName || "Unknown"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="drop-timeline-div">
                        <img src={bloodDropImage}></img>
                    </div>
                </div>
            ) : (
                <p>No donation history found.</p>
            )}
        </div>
    );
}

export default DonationHistory;
