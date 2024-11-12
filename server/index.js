import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import http from "http";
import {Server} from "socket.io";
dotenv.config();


const app = express();
const PORT = 5000;

// Middleware setUp
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET","POST"],
    }
});

// Database information
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Sign up 
app.post('/api/signup', async (req, res) => {
    let data = req.body;
    console.log('Data received:', data);
    try {
        const client = await pool.connect();
        const query2 = 'SELECT * FROM users WHERE username = $1';
        const values2 = [req.body["username"]];
        const result2 = await client.query(query2, values2);
        if (result2.rows.length > 0) {
            res.status(401).json({ message: "email already exists" });
        }
        else {
            const query = 'INSERT INTO users (username, passwords, bloodGroup) VALUES ($1, $2, $3)';
            const values = [req.body["username"], req.body["password"], req.body["bloodGroup"]];
            await client.query(query, values);
            const token = jwt.sign(
                { username: req.body["username"] },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.status(200).json({ message: 'account created', token });
        }
        client.release();
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Internal server error');
    }
});

// Log In
app.post('/api/login', async (req, res) => {
    let data = req.data;
    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM users WHERE username = $1';
        const value = req.body['username'];
        const result = await client.query(query, [value]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.passwords === req.body["password"]) {
                const token = jwt.sign(
                    { username: req.body["username"] },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.status(200).json({ message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Incorrect password' });
            }
        } else {
            res.status(401).json({ message: 'email not found' });
        }
        client.release();
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Internal server error');
    }
});

app.post("/api/find-donor", async (req, res) => {
    const { name, age, gender, height, weight, bloodGroup, latitude, longitude } = req.body;
    
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT username FROM users WHERE bloodGroup = $1",[bloodGroup]);
        const emailAddresses = result.rows.map(row => row.username);
        console.log(emailAddresses);
        let transporter = nodemailer.createTransport({
            service: "gmail", // or any email service provider
            auth: {
                user: "divyambhasin2026@gmail.com",
                pass: "ojpy yaci otaj rlzq"
            }
        });

        // Email options
        const emailOptions = {
            from: "divyambhasin2026@gmail.com",
            subject: "Blood Donation Request",
            html: `<p>Dear Donor,</p>
                   <p>We have a patient in need of blood (${bloodGroup}) near your location. If you are available, please visit the website.</p>
                   <p>Thank you for your support!</p>`
        };

        // Send email to each user
        for (const email of emailAddresses) {
            await transporter.sendMail({ ...emailOptions, to: email });
        }
        client.release();
        res.json({ message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).json({ message: "Error sending emails" });
    }
});

io.on("connection",(socket)=>{
    console.log(`user connected: ${socket.id}`);
    socket.on("send_message",(data)=>{
        console.log(data);
        socket.broadcast.emit("receive_message",data);
    });
});

app.get('/', (req, res) => {
    res.send('Server is working!');
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// ojpy yaci otaj rlzq