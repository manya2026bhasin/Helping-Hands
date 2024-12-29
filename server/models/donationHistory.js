import mongoose from "mongoose";

const DonationHistorySchema = new mongoose.Schema({
    donorId: { type: String, required: true },
    recipientId: { type: Number, required: true },
    recipientName: { type: String, required: true },
    donationDate: { type: Date, required: true, unique: true },
    bloodGroup: { type: String, required: true },
});

const DonationHistory = mongoose.model("DonationHistory", DonationHistorySchema);

export default DonationHistory;
