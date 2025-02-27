import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../styles/findDonor.css";
import API_BASE_URL from "../apiconfig";

function LoginForm() {
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        if (form.username != "" && form.password != "") {
            try {
                const result = await axios.post(`${API_BASE_URL}/api/login`, form);
                if (result.status === 200) {
                    localStorage.setItem('token', result.data.token);
                    navigate('/donor-dashboard');
                }
            }
            catch (error) {
                console.error('Error sending data:', error);
                alert('Error submitting the form');
            }
        }
    }

    function handleFormData(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    }

    return (
        <div className="card-page">
            <div className="card">
                Log In
                <div>
                    <label>username</label>
                    <input name="username" value={form.username} onChange={handleFormData}></input>
                </div>
                <div>
                    <label>password</label>
                    <input name="password" value={form.password} onChange={handleFormData}></input>
                </div>
                <button onClick={handleSubmit}>Log In</button>
            </div>
        </div>
    );
}

export default LoginForm;
