import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/findDonorLoader.css";
import socket from "./socket";

function FindDonorLoader() {
    const [donorFound, setDonorFound] = useState(false);

    useEffect(() => {

        socket.on("donor_found", (data) => {
            console.log(data);
            setDonorFound(true);
        });
        return () => {
            socket.off("donor_found");
        };

    }, []);

    return (
        <div>
            {donorFound ? (
                <div className="donor-found">
                    <h1>Donor Found!</h1>
                    <p>A donor has been located and will be in touch with you shortly.</p>
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
