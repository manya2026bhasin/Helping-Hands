import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { addDonor, findAvailableDonors, findAllDonors } from "./models/donorModel.js";  // Import MongoDB functions

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
        // Check if username already exists
        const existingUsers = await findAllDonors();
        const userExists = existingUsers.some(user => user.contactInfo.email === email);

        if (userExists) {
            return res.status(401).json({ message: "Email already exists" });
        }

        // Add new user
        await addDonor({fullname: fullName, password, dob, gender, bloodGroup, contactInfo: {email: email, phone: contactNumber}, location: {latitude, longitude}, availability: true });
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    const { bloodGroup, latitude, longitude } = req.body;

    try {
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

        res.json({ message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).json({ message: "Error sending emails" });
    }
});

// Socket.IO setup for real-time messaging
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("send_message", (data) => {
        console.log(data);
        socket.broadcast.emit("receive_message", data);
    });
});

app.get('/', (req, res) => {
    res.send('Server is working!');
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
