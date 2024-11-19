import React, { useState, useEffect } from "react";
import "../styles/healthStatus.css";
import axios from "axios";

function HealthStatus({ getEmailFromToken }) {
    const [healthData, setHealthData] = useState({});
    const [formVisible, setFormVisible] = useState(false);
    const [recentIllness, setRecentIllness] = useState("no");
    const [available, setAvailable] = useState(false);

    const fetchHealthStatus = async () => {
        try {
            const email = getEmailFromToken();
            const donorHealthResponse = await axios.get(`http://localhost:5000/api/donor/health/${email}`);
            setHealthData(donorHealthResponse.data.donorHealth);
            setAvailable(donorHealthResponse.data.donorHealth.isAvailable);
        } catch (error) {
            console.error("Error fetching health status for donor:", error);
        }
    };

    useEffect(() => {
        fetchHealthStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            email: getEmailFromToken(),
            height: formData.get("height"),
            weight: formData.get("weight"),
            haemoglobin: formData.get("haemoglobin"),
            lastDonationDate: formData.get("lastDonationDate"),
            recentIllnesses: recentIllness === "yes" ? true : false,
        };

        try {
            const response = await axios.post("http://localhost:5000/api/donor/health", data);
            if (response.status === 200) {
                fetchHealthStatus();
                setFormVisible(false);
            }
        } catch (error) {
            console.error("Error posting health status to backend:", error);
        }
    };

    return (
        <div className="donor-health-main-div">
            <div className="donor-health-card">
                {healthData ? (
                    <div>
                        <h3>Your Health Status</h3>
                        <p>Height: {healthData.height} cm</p>
                        <p>Weight: {healthData.weight} kg</p>
                        <p>Haemoglobin: {healthData.haemoglobin} g/dL</p>
                        <p>Last Donation Date: {healthData.lastDonationDate || "N/A"}</p>
                        <p>Recent Illnesses: {healthData.recentIllnesses || "None"}</p>
                        <p>Availability: {healthData.isAvailable ? "Available" : "Not Available"}</p>
                        <button onClick={() => setFormVisible(true)}>Update Details</button>
                    </div>
                ) : (
                    <div>
                        <p className="fill-form-icon">📝</p>
                        <p>It looks like you haven't filled the form yet. Please fill it as soon as possible so that we can determine your availability status</p>
                        <button onClick={() => setFormVisible(true)}>Fill Health Details</button>
                    </div>
                )}
            </div>

            {formVisible && (
                <div className="donor-health-form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>
                                Height (cm):
                                <input name="height" type="number" defaultValue={healthData?.height || ""} required />
                            </label>
                        </div>
                        <div>
                            <label>
                                Weight (kg):
                                <input name="weight" type="number" defaultValue={healthData?.weight || ""} required />
                            </label>
                        </div>
                        <div>
                            <label>
                                Haemoglobin (g/dL):
                                <input name="haemoglobin" type="number" step="0.1" defaultValue={healthData?.haemoglobin || ""} required />
                            </label>
                        </div>
                        <div>
                            <label>
                                Last Donation Date:
                                <input name="lastDonationDate" type="date" defaultValue={healthData?.lastDonationDate || ""} />
                            </label>
                        </div>
                        <div>
                            <label>
                                Recent Illnesses or Medications:
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="recentIllness"
                                            value="yes"
                                            checked={recentIllness === "yes"}
                                            onChange={(e) => setRecentIllness(e.target.value)}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="recentIllness"
                                            value="no"
                                            checked={recentIllness === "no"}
                                            onChange={(e) => setRecentIllness(e.target.value)}
                                        />
                                        No
                                    </label>
                                </div>
                            </label>
                        </div>
                        <div>
                            <button type="submit">Save Details</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="availability-div">
            {available ? (
                    <div>
                        <h1 className="available-heading">Available  🎊🎊</h1>
                        <h2>According to the details provided, u can donate your blood 🩸</h2>
                    </div>
                ) : (
                    <div>
                        <h1 className="not-available-heading">Not Available 😔</h1>
                        <h2>According to the details provided, u can't donate your blood 🩸</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HealthStatus;
