import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../styles/findDonorLoader.css";
// import io from "socket.io-client";
// const socket = io.connect("http://localhost:5000");

function FindDonorLoader() {

    return (
        <div className="loading-page">
            <div className="loading">We are finding donors near you. Please wait for a while.....
            Whenever a donor is available for donation you will be informed
            </div>
            <div class="loader"></div>
        </div>
    );
}

export default FindDonorLoader;
