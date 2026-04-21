import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    amount: Number,
    currency: { type: String, default: "INR" },
    razorpayOrderId: String,
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: String,
    method: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    appliedTo: [
      {
        payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        month: String,
        amount: Number,
      },
    ],
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
