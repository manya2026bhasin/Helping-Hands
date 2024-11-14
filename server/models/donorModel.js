import mongoose from 'mongoose';

// Define the schema for a donor
const donorSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    lastDonationDate: {
        type: Date
    },
    availabilityStatus: {
        type: Boolean,
        default: true // true if available to donate, false otherwise
    }
});

// Create the model from the schema
const Donor = mongoose.model('Donor', donorSchema);

// Function to add a new donor
export const addDonor = async (donorData) => {
    try {
        const newDonor = new Donor(donorData);
        await newDonor.save();
        return newDonor;
    } catch (error) {
        console.error("Error adding donor:", error);
        throw error;
    }
};

// Function to find all available donors
export const findAvailableDonors = async () => {
    try {
        const availableDonors = await Donor.find({ availabilityStatus: true });
        return availableDonors;
    } catch (error) {
        console.error("Error finding available donors:", error);
        throw error;
    }
};

// Function to find all donors
export const findAllDonors = async () => {
    try {
        const allDonors = await Donor.find();
        return allDonors;
    } catch (error) {
        console.error("Error finding all donors:", error);
        throw error;
    }
};

// Export the Donor model as default
export default Donor;
