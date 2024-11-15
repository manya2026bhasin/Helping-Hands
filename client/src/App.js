import {useState} from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/home";
import FindDonor from "./components/findDonor";
import BecomeDonor from "./components/becomeDonor";
import DonorDashboard from "./components/donorDashboard";
import LoginForm from "./components/loginForm";
import FindDonorLoader from "./components/findDonorLoader";
import './App.css';

function App() {
  const [latitude,setLatitude] = useState();
  const [longitude,setLongitude] = useState();
  const geo = navigator.geolocation;
  geo.getCurrentPosition(setPosition);
  function setPosition(position){
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-donor-form" element={<FindDonor />} />
        <Route path="/find-donor-loader" element={<FindDonorLoader />} />
        <Route path="/become-donor-form" element={<BecomeDonor />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/login-form" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
