import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Patient from "./models/donation.js";
import { addDonor, findAvailableDonors, findAllDonors, findDonorByEmail } from "./models/donorModel.js";  // Import MongoDB functions
import { log } from "console";

dotenv.config();

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("MongoDB connection error:", error));

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

// Sign Up
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password, bloodGroup, latitude, longitude, contactNumber, gender, dob } = req.body;
    console.log('Data received:', req.body);

    try {
        // Check if email already exists
        const existingUsers = await findAllDonors();
        const userExists = existingUsers.some(user => user.contactInfo.email === email);

        if (userExists) {
            return res.status(401).json({ message: "Email already exists" });
        }

        // Add new user
        await addDonor({fullname: fullName, password, dob, gender, bloodGroup, contactInfo: {email: email, phone: contactNumber}, location: {latitude, longitude}, availability: true });
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.status(200).json({ message: 'Account created', token });
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Log In
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUsers = await findAllDonors();
        const user = existingUsers.find(u => u.contactInfo.email === username);

        if (user && user.password === password) {
            const token = jwt.sign({ email: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log(token);
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: user ? 'Incorrect password' : 'Email not found' });
        }
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Find Donor
app.post("/api/find-donor", async (req, res) => {
    const { pname, gender, dob, contactNumber, email, bloodGroup, latitude, longitude } = req.body;

    try {
        console.log(req.body);
        const patient = new Patient({
            fullname: pname,
            dob,
            gender,
            bloodGroup,
            contactInfo: { email, phone: contactNumber },
            location: { latitude, longitude }
        });

        const savedPatient = await patient.save();
        // Find available donors in the specified radius
        const availableDonors = await findAvailableDonors(bloodGroup, { latitude, longitude });
        const emailAddresses = availableDonors.map(donor => donor.contactInfo.email);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.PASS }
        });

        // Email options
        const emailOptions = {
            from: process.env.EMAIL,
            subject: "Blood Donation Request",
            html: `<p>Dear Donor,</p>
                   <p>A patient in need of blood (${bloodGroup}) is near your location. If you are available, please visit our website.</p>
                   <p>Thank you for your support!</p>`
        };

        // Send email to each user
        for (const email of emailAddresses) {
            await transporter.sendMail({ ...emailOptions, to: email });
        }

        res.json({ 
            message: "Emails sent successfully!",
            patientId: savedPatient.serialId 
        });
    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).json({ message: "Error sending emails" });
    }
});

app.get('/api/donors', async (req, res) => {
    const email = req.query.email; // Use query parameters
    try {
        const donor = await findDonorByEmail(email);
        console.log(donor);
        if (donor) {
            res.status(200).json({ donor });
        } else {
            res.status(404).json({ error: "Donor not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.removeAllListeners();
    // Event to allow a patient to join their specific room
    socket.on("register_patient", (patientId) => {
        socket.join(patientId);
        console.log(`Patient with ID ${patientId} joined room ${patientId}`);
    });

    socket.on("send_message", (data) => {
        console.log(data);
        socket.broadcast.emit("receive_message", data);
        // socket.join(data.patientId);
    });

    // Handle donor availability and notify specific patient
    socket.on("donor_available", (data) => {
        const { email, patientId } = data; // Ensure patientId is passed in data
        console.log(`Donor available: ${email} for Patient ID: ${patientId}`);
        // socket.join(patientId);
        // Notify only the specified patient's room
        io.to(patientId).emit("donor_found", {
            donorEmail: email,
            message: "A donor is available for your request.",
            patientId: patientId
        });
        console.log(`Notified patient in room ${patientId}`);
        
    });


    // socket.on("donor_available", (data) => {
    //     console.log(data);
    //     socket.to(data.patientId).emit("donor_found", data);
    
    // });
    // Optional: Clean up or log when users disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


app.get('/', (req, res) => {
    res.send('Server is working!');
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
