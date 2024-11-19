import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/findDonorLoader.css";
import socket from "./socket";

function FindDonorLoader() {
    const [donorFound, setDonorFound] = useState(false);
    const [donorsDetails, setDonorsDetails] = useState([]);

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
    };

    return (
        <div>
            {donorFound && donorsDetails.length>0 ? (
                <div className="donor-found">
                    <h1>Donor Found!</h1>
                    <p>A donor has been located!! Here are the details.</p>
                    <div>
                    <p><span className="red-text">Email:</span> {donorsDetails[0].donorEmail}</p>
                    <p><span className="red-text">Phone:</span> {donorsDetails[0].donorPhone}</p>
                    <button className="green-btn" onClick={handleConfirm}>Confirm</button>
                    <button className="red-btn" onClick={removeFirstEntry}>Reject</button>
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
