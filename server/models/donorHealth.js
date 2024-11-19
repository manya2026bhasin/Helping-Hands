import mongoose from 'mongoose';

const donorHealthSchema = new mongoose.Schema({
    donorId: { type: String, required: true, unique: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    haemoglobin: { type: Number, required: true },
    lastDonationDate: { type: Date },
    recentIllnesses: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
});

const DonorHealth = mongoose.model("DonorHealth", donorHealthSchema);
export default DonorHealth;
