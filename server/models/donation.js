import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const AutoIncrementPlugin = AutoIncrement(mongoose);

const patientSchema = new mongoose.Schema({
    fullname: {
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
    date: {
        type: Date,
        default: Date.now,
    },
    donorId: {
        type: String
    }
});

// Apply AutoIncrement plugin
patientSchema.plugin(AutoIncrementPlugin, { inc_field: 'serialId' });

export const findPatientById = async (patientId) => {
    try {
        return await Patient.findOne({ "serialId": patientId });
    } catch (error) {
        console.error("Error finding patient by patientId:", error);
        throw error;
    }
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
