import mongoose from 'mongoose';
import DonorHealth from "./donorHealth.js"; // Adjust path if needed
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
    },
    notifications: [
        {
          patientId: Number,
          timestamp: {
            type: Date,
            default: Date.now
          },
          status: {
            type: String,
            enum: ['unread', 'read'],
            default: 'unread'
          }
        }
      ],
      donations: [
        {
            patientId:{
                type: Number
            },
            date: {
                type: Date
            }
        }
      ]
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
export const findAvailableDonors = async (bloodGroup, { latitude, longitude } ) => {
    try {
        // Fetch all available donors
        const donors = await Donor.find({ availabilityStatus: true, bloodGroup: bloodGroup });

        const radiusInKm = 10; // 10 km
        const earthRadiusKm = 6371; // Earth's radius in km

        const nearbyDonors = donors.filter(donor => {
            const donorLat = donor.location.latitude;
            const donorLon = donor.location.longitude;

            // Haversine formula
            const latDiff = degreesToRadians(latitude - donorLat);
            const lonDiff = degreesToRadians(longitude - donorLon);

            const a = Math.sin(latDiff / 2) ** 2 +
                Math.cos(degreesToRadians(latitude)) *
                Math.cos(degreesToRadians(donorLat)) *
                Math.sin(lonDiff / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = earthRadiusKm * c; // Distance in km

            return distance <= radiusInKm; // Return true if donor is within 10 km
        });

        return nearbyDonors;
    } catch (error) {
        console.error("Error finding available donors:", error);
        throw error;
    }
};

// Helper function to convert degrees to radians
const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;


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

export const findDonorByEmail = async (email) => {
    try {
        return await Donor.findOne({ "contactInfo.email": email });
    } catch (error) {
        console.error("Error finding donor by email:", error);
        throw error;
    }
};

export const addNotificationToDonor = async (donorId, notificationData) => {
    try {
        const donor = await Donor.findById(donorId);
        if (!donor) {
            throw new Error("Donor not found");
        }

        donor.notifications.push(notificationData);
        await donor.save();

        return donor;
    } catch (error) {
        console.error("Error adding notification to donor:", error);
        throw error;
    }
};

// Function to get all notifications for a donor
export const getNotificationsForDonor = async (donorId) => {
    try {
        const donor = await Donor.findById(donorId).select('notifications');
        if (!donor) {
            throw new Error("Donor not found");
        }

        return donor.notifications;
    } catch (error) {
        console.error("Error retrieving notifications for donor:", error);
        throw error;
    }
};

export const updateDonations = async (donorId, patientId, date) => {
    try {
        const donor = await Donor.findById(donorId);
        if (!donor) {
            throw new Error("Donor not found");
        }

        // Add donation record
        donor.donations.push({ patientId, date });
        donor.lastDonationDate = date;
        donor.availabilityStatus = false;
        await donor.save();

        // Update donor availability status in DonorHealth model
        const updatedDonorHealth = await DonorHealth.findOneAndUpdate(
            { donorId },
            { isAvailable: false, lastDonationDate: date },
            { new: true }
        );

        if (!updatedDonorHealth) {
            throw new Error("DonorHealth record not found for this donor");
        }

    } catch (error) {
        console.error("Error updating donation data and availability:", error);
        throw error;
    }
};


export const updateAllDonorsAvailability = async () => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Update Donor model
        const updatedDonors = await Donor.updateMany(
            { lastDonationDate: { $lte: threeMonthsAgo } },
            { $set: { availabilityStatus: true } }
        );

        // Update DonorHealth model
        const updatedDonorHealth = await DonorHealth.updateMany(
            { lastDonationDate: { $lte: threeMonthsAgo } },
            { $set: { isAvailable: true } }
        );

        console.log(`Updated ${updatedDonors.modifiedCount} donors in Donor model.`);
        console.log(`Updated ${updatedDonorHealth.modifiedCount} donors in DonorHealth model.`);
    } catch (error) {
        console.error("Error updating donors' availability status:", error);
    }
};

// Export the Donor model as default
export default Donor;
