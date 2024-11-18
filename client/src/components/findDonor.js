import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../styles/findDonor.css";
import socket from "./socket";

function FindDonor() {
    const [form, setForm] = useState({
        pname: "",
        dob: "",
        gender: "",
        height: "",
        weight: "",
        bloodGroup: "A+",
        contactNumber: "",
        email: "",
        latitude: null,
        longitude: null
    });
    const geo = navigator.geolocation;
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        if(form.latitude == null){
            alert("please provide access to your location");
        }
        try {
            const result = await axios.post('http://localhost:5000/api/find-donor', form);
            if (result.status === 200) {
                const { patientId } = result.data;
                socket.emit("register_patient", patientId);
                socket.emit("send_message", { form, patientId });
                navigate('/find-donor-loader');
            }
        }
        catch (error) {
            console.error('Error sending data:', error);
            alert('Error submitting the form');
        }
    }

    function handleFormData(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    }

    function findPatient() {
        if (geo) {
            geo.getCurrentPosition(setPosition, handleError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function setPosition(position) {
        const { latitude, longitude } = position.coords;
        setForm(prevForm => ({
            ...prevForm,
            latitude: latitude,
            longitude: longitude
        }));
        alert(`Latitude: ${latitude}, Longitude: ${longitude}`);
    }

    function handleError(error) {
        console.error("Error occurred while getting location:", error);
        alert("Unable to retrieve your location. Please enable location services in your device permissions.");
    }

    return (
        <div className="card-page">
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className='form-header'>Enter patient's personal details</div>
                    <div className='form-body'></div>
                    <div>
                        <span>Name : </span>
                        <input type="text" name="pname" value={form.pname} placeholder="Enter your name" onChange={handleFormData} required />
                    </div>
                    <div>
                            <label>Date of Birth:</label>
                            <input type="date" name="dob" value={form.dob} onChange={handleFormData} required />
                        </div>
                    <div>
                        <span>Gender : </span>
                        <label>
                            <input type="radio" name="gender" value="Male" onChange={handleFormData} /> Male
                        </label><br/>
                        <label>
                            <input type="radio" name="gender" value="Female" onChange={handleFormData} /> Female
                        </label><br />
                    </div>
                    <div>
                        <span>Height : </span>
                        <input type="number" name="height" placeholder="(in cms)" onChange={handleFormData} required />
                    </div>
                    <div>
                        <span>Weight : </span>
                        <input type="number" name="weight" placeholder="in kg" onChange={handleFormData} required />
                    </div>
                    <div>
                        <span>Your blood group : </span>
                        <select name="bloodGroup" onChange={handleFormData} required>
                            <option value="A+">A+</option>
                            <option value="B+">B+</option>
                            <option value="AB+">AB+</option>
                            <option value="O+">O+</option>
                            <option value="A-">A-</option>
                            <option value="B-">B-</option>
                            <option value="AB-">AB-</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div>
                            <label>Contact Number:</label>
                            <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleFormData} required />
                        </div>

                        <div>
                            <label>Email Address:</label>
                            <input type="email" name="email" value={form.email} onChange={handleFormData} required />
                        </div>
                    <div>
                        Please allow us to access your current location
                        <button type="button" onClick={findPatient}>Access Location</button>
                    </div>
                    <div>
                        <button className="form-submit" type="submit">SUBMIT</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FindDonor;
