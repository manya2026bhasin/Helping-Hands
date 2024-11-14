import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/becomeDonor.css";

function BecomeDonor() {
    const [eligible, setEligible] = useState(false); // State to check eligibility
    const [formData, setFormData] = useState({
        fullName: "",
        dob: "",
        gender: "Male",
        contactNumber: "",
        email: "",
        bloodGroup: "A+",
        illness: "",
        medication: "",
        allergies: "",
        allergyDetails: "",
        tattoos: "",
        recentDonation: "",
        consent: false,
        password: "",
        username: "",
        latitude: null,
        longitude: null
    });
    const geo = navigator.geolocation;
    const navigate = useNavigate();
    function handleSubmit(e) {
        e.preventDefault();
        
        // Eligibility criteria
        if (formData.illness === "yes" || formData.medication === "yes") {
            alert("You are unfit to donate blood based on the provided information.");
        } else {
            alert("Thank you for signing up! You are eligible to donate blood.");
            setEligible(true);
        }
    }

    function handleFormData(e) {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    // function handleSignupData(e) {
    //     const { name, value } = e.target;
    //     setLoginData({
    //         ...loginData,
    //         [name]: value
    //     });
    // }

    async function handleSignupSubmit(e) {
        e.preventDefault();
        if(formData.username && formData.password){
            try{
              const result = await axios.post('http://localhost:5000/api/signup', formData);
              if(result.status === 200){
                localStorage.setItem('token', result.data.token);
                navigate('/donor-dashboard');
              }
            }
            catch(error){
              console.error('Error sending data:', error);
              alert('Account already exists');
            }
          }
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
        setFormData(prevForm => ({
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
        <div className="form-page">
            <div className="card">
            {!eligible ? (
                <form onSubmit={handleSubmit}>
                    <div className='form-header'>Enter your personal details</div>
                    <div className='form-body'>
                        {/* Form fields */}
                        <div>
                            <label>Full Name:</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleFormData} required />
                        </div>

                        <div>
                            <label>Date of Birth:</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleFormData} required />
                        </div>

                        <div>
                            <label>Gender:</label>
                            <select name="gender" value={formData.gender} onChange={handleFormData}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label>Contact Number:</label>
                            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleFormData} required />
                        </div>

                        <div>
                            <label>Email Address:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleFormData} required />
                        </div>
                        
                        <div>
                            <span>Your blood group : </span>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFormData} >
                                <option value="A+" >A+</option>
                                <option value="B+" >B+</option>
                                <option value="AB+" >AB+</option>
                                <option value="O+" >O+</option>
                                <option value="A-" >A-</option>
                                <option value="B-" >B-</option>
                                <option value="AB-" >AB-</option>
                                <option value="O-" >O-</option>
                            </select>
                        </div>

                        <div>
                            <label>Do you have any major illnesses?</label>
                            <input type="radio" name="illness" value="yes" onChange={handleFormData} /> Yes
                            <input type="radio" name="illness" value="no" onChange={handleFormData} /> No
                        </div>

                        <div>
                            <label>Are you currently on any medication?</label>
                            <input type="radio" name="medication" value="yes" onChange={handleFormData} /> Yes
                            <input type="radio" name="medication" value="no" onChange={handleFormData} /> No
                        </div>

                        <div>
                            <label>Do you have any allergies?</label>
                            <input type="radio" name="allergies" value="yes" onChange={handleFormData} /> Yes
                            <input type="radio" name="allergies" value="no" onChange={handleFormData} /> No
                            <input type="text" name="allergyDetails" placeholder="If yes, specify" value={formData.allergyDetails} onChange={handleFormData} />
                        </div>

                        <div>
                            <label>Do you have any tattoos or piercings?</label>
                            <input type="radio" name="tattoos" value="yes" onChange={handleFormData} /> Yes
                            <input type="radio" name="tattoos" value="no" onChange={handleFormData} /> No
                            <input type="text" name="tattooDate" placeholder="If yes, when?" value={formData.tattooDate} onChange={handleFormData} />
                        </div>

                        <div>
                            <label>Have you donated blood in the last 3 months?</label>
                            <input type="radio" name="recentDonation" value="yes" onChange={handleFormData} /> Yes
                            <input type="radio" name="recentDonation" value="no" onChange={handleFormData} /> No
                        </div>

                        <div>
                            <label>Please allow us access to your location.</label>
                            <button onClick={findPatient}>Allow access</button>
                        </div>

                        <div>
                            <label>
                                <input type="checkbox" name="consent" checked={formData.consent} onChange={handleFormData} required />
                                I consent to the processing of my personal data for blood donation purposes.
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit">Submit</button>
                </form>
                 ) : (
                    <form onSubmit={handleSignupSubmit} className="signup-form">
                        <div className="form-header">Create your login credentials</div>
                        <div>
                            <label>Username:</label>
                            <input type="text" name="username" value={formData.username} onChange={handleFormData} required />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input type="password" name="password" value={formData.password} onChange={handleFormData} required />
                        </div>
                        <button type="submit">Sign up</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default BecomeDonor;
