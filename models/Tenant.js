import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, index: true },
    email: { type: String, index: true, sparse: true },
    passwordHash: String,
    roomNumber: String,
    rentAmount: Number,
    startDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Tenant ||
  mongoose.model("Tenant", TenantSchema);
