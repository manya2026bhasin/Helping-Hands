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

donorHealthSchema.pre("save", function (next) {
    this.isAvailable = this.haemoglobin >= 12.5 && this.weight >= 50 && !this.recentIllnesses;
    next();
});

const DonorHealth = mongoose.model("DonorHealth", donorHealthSchema);

export const updateAvailability = async (donorId,isAvailable) => {
    try {
        const updatedDonor = await DonorHealth.findOneAndUpdate(
            { donorId },
            { isAvailable: isAvailable },
            { new: true }
        );

        if (!updatedDonor) {
            throw new Error(`Donor with ID ${donorId} not found`);
        }

        return updatedDonor;
    } catch (error) {
        console.error("Error updating donor's availability:", error);
        throw error;
    }
};

export default DonorHealth;
