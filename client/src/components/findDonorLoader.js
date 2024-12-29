import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/findDonorLoader.css";
import socket from "./socket";

function FindDonorLoader() {
    const [donorFound, setDonorFound] = useState(false);
    const [donorsDetails, setDonorsDetails] = useState([]);
    const [donorConfirmed, setDonorConfirmed] = useState(false);

    useEffect(() => {

        socket.on("donor_found", (data) => {
            console.log(data);
            setDonorFound(true);
            setDonorsDetails((prevDetails) => [
                ...prevDetails,
                data
            ]);
        });
        return () => {
            socket.off("donor_found");
        };

    }, []);

    const removeFirstEntry = () => {
        setDonorsDetails((prevDetails) => {
            const updatedDetails = prevDetails.slice(1);
            return updatedDetails;
        });
    };

    const handleConfirm = async() => {
        console.log("handling confirm button");
        try{
            const email = donorsDetails[0].donorEmail;
            const patientId = donorsDetails[0].patientId;
            const response = await axios.post("http://localhost:5000/api/otherdonors/deletenotifications", { email, patientId });
            if (response.status === 200) {
                console.log("Notification deleted for other donors:", response.data);
                setDonorConfirmed(true);
            } else {
                console.error("Failed to delete notification:", response);
            }
        }
        catch(error){
            console.log("error in handling confirm:",error);
        }
    };

    const handleDonationSuccess = async() => {
        try{
            const email = donorsDetails[0].donorEmail;
            const patientId = donorsDetails[0].patientId;
            const response = await axios.post("http://localhost:5000/api/donors/history", { email, patientId });
            if (response.status === 200) {
                console.log("donation added to records");
            } else {
                console.error("Failed to add donation:", response);
            }
        }
        catch(error){
            console.log("error in handling donation success:",error);
        }
    };

    return (
        <div>
            {donorFound && donorsDetails.length > 0 ? (
                <div className="donor-found">
                    <h1>Donor Found!</h1>
                    <p>A donor has been located!! Here are the details.</p>
                    <div>
                    <p><span className="red-text">Email:</span> {donorsDetails[0].donorEmail}</p>
                    <p><span className="red-text">Phone:</span> {donorsDetails[0].donorPhone}</p>
                    {donorConfirmed ? (
                            <button className="green-btn" onClick={handleDonationSuccess}>Donation Successful</button>
                        ) : (
                            <>
                                <button className="green-btn" onClick={handleConfirm}>Confirm</button>
                                <button className="red-btn" onClick={removeFirstEntry}>Reject</button>
                            </>
                        )}
                    </div>
                    <p>** Please contact the donor once before confirming or rejecting</p>
                </div>
            ) : (
                <div className="loading-page">
                    <div className="loading">
                        We are finding donors near you. Please wait for a while...
                        Whenever a donor is available for donation, you will be informed.
                    </div>
                    <div className="loader"></div>
                </div>
            )}
        </div>
    );
}

export default FindDonorLoader;
