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
import { findPatientById } from "./models/donation.js";
import DonationHistory from "./models/donationHistory.js";
import DonorHealth from "./models/donorHealth.js";
import { updateAvailability } from "./models/donorHealth.js";
import { addDonor, findAvailableDonors, findAllDonors, findDonorByEmail, updateDonations } from "./models/donorModel.js";  // Import MongoDB functions
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
        await addDonor({ fullname: fullName, password, dob, gender, bloodGroup, contactInfo: { email: email, phone: contactNumber }, location: { latitude, longitude }, availability: true });
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

app.get('/api/donors/notifications', async (req, res) => {
    const { email } = req.query;

    try {
        const donor = await findDonorByEmail(email);
        if (!donor) {
            return res.status(404).json({ error: "Donor not found" });
        }
        console.log(donor.notifications);
        res.json({ notifications: donor.notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/donors/notifications', async (req, res) => {
    const { patientId, bloodGroup, timestamp, status } = req.body;

    try {
        // Find donors with the matching blood group
        const donors = await findAllDonors(); // Assumes this fetches all donors
        const specificDonors = donors.filter(donor => donor.bloodGroup === bloodGroup && donor.availabilityStatus === true); // Use `filter` to get matching donors

        if (!specificDonors || specificDonors.length === 0) {
            return res.status(404).json({ error: "No donors found for this blood group" });
        }

        // Save the notification to each donor
        const notification = { patientId, timestamp, status };

        await Promise.all(
            specificDonors.map(async (donor) => {
                donor.notifications.push(notification); // Assuming `notifications` is an array in donor schema
                await donor.save(); // Save the updated donor document
            })
        );

        res.status(201).json({ message: "Notification saved to donor(s)" });
    } catch (error) {
        console.error("Error saving notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/api/patients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const patient = await findPatientById(id);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        console.log("patient", patient);
        res.status(200).json(patient);
    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/donors/deletenotifications', async (req, res) => {
    const { email, patientId } = req.body;

    try {
        // Find donors with the matching blood group
        const donor = await findDonorByEmail(email);

        if (!donor) {
            return res.status(404).json({ error: "No donor found for this email" });
        }

        // delete the notification
        donor.notifications = donor.notifications.filter(notification => notification.patientId !== patientId);

        await donor.save();

        res.status(201).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error saving notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/donor/health/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const donor = await findDonorByEmail(email);
        if (!donor) {
            return res.status(401).json({ success: false, message: "Donor not found" });
        }

        const donorId = donor._id;
        const donorHealth = await DonorHealth.findOne({ donorId });
        if (!donorHealth) {
            return res.status(404).json({ success: false, message: "Donor health data not found" });
        }
        res.status(200).json({ success: true, donorHealth });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/donor/health", async (req, res) => {
    const { email, height, weight, haemoglobin, lastDonationDate, recentIllnesses } = req.body;

    try {
        // Calculate availability
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const isAvailable = haemoglobin >= 12.5 &&
            (!lastDonationDate || new Date(lastDonationDate) < threeMonthsAgo) &&
            (!recentIllnesses || recentIllnesses.trim() === "");

        // Upsert donor health data
        const donor = await findDonorByEmail(email);
        if (!donor) {
            return res.status(401).json({ success: false, message: "Donor not found" });
        }

        const donorId = donor._id;
        const donorHealth = await DonorHealth.findOneAndUpdate(
            { donorId },
            {
                donorId,
                height,
                weight,
                haemoglobin,
                lastDonationDate,
                recentIllnesses,
                isAvailable,
            },
            { upsert: true, new: true }
        );

        donor.availabilityStatus = isAvailable;
        res.status(200).json({ success: true, donorHealth });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/otherdonors/deletenotifications", async (req, res) => {
    const { email, patientId } = req.body;

    try {
        const donors = await findAllDonors();
        const donor = await findDonorByEmail(email);
        if (!donor) {
            return res.status(401).json({ success: false, message: "Donor not found" });
        }
        for (const d of donors) {
            if (d.contactInfo.email !== email) {
                console.log("donor email",d.email);
                d.notifications = d.notifications.filter(
                    (notification) => notification.patientId !== patientId
                );
                await d.save();
            }
        }

        res.status(200).json({ success: true, message: "Notifications updated for all donors except the specified donor" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/donors/history", async (req, res) => {
    const { email, patientId } = req.body;

    try {
        const donor = await findDonorByEmail(email);
        const donorId = donor._id;
        console.log(donorId);
        const recipient = await findPatientById(patientId);
        console.log(recipient);
        const recipientId = recipient.serialId;
        const newRecord = new DonationHistory({
            donorId,
            recipientId,
            recipientName: recipient.fullname,
            donationDate: new Date(),
            bloodGroup: recipient.bloodGroup
        });
        console.log("new record",newRecord);
        const savedRecord = await newRecord.save();
        await updateDonations(donorId, patientId, new Date());
        res.status(200).json({ success: true, data: savedRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/api/donors/history/:email", async (req, res) => {
    const { email } = req.params;

    try {
        console.log(email);
        const donor = await findDonorByEmail(email);

        if (!donor) {
            return res.status(404).json({ success: false, message: "Donor not found" });
        }

        const history = await DonationHistory.find({ donorId: donor._id}).sort({ donationDate: -1 });
        console.log("history: ",history);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/api/donors/points/:email", async (req,res) => {
    const { email } = req.params;

    try {
        console.log(email);
        const donor = await findDonorByEmail(email);

        if (!donor) {
            return res.status(404).json({ success: false, message: "Donor not found" });
        }

        const points = donor.donations.length * 50;

        res.status(200).json({ success: true, data: points });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
    socket.on("donor_available", async (data) => {
        const { email, patientId } = data; // Ensure patientId is passed in data
        console.log(`Donor available: ${email} for Patient ID: ${patientId}`);

        try {
            // Fetch donor details by email
            const donor = await findDonorByEmail(email);

            if (!donor) {
                console.error(`No donor found with email: ${email}`);
                return;
            }

            // Notify only the specified patient's room
            io.to(patientId).emit("donor_found", {
                donorEmail: email,
                donorPhone: donor.contactInfo.phone, // Add the donor's phone number here
                message: "A donor is available for your request.",
                patientId: patientId
            });

            console.log(`Notified patient in room ${patientId} with donor's phone number.`);
        } catch (error) {
            console.error(`Error fetching donor details for email ${email}:`, error);
        }
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
