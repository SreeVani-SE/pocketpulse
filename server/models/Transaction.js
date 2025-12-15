import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Google "sub"
    type: { type: String, required: true, enum: ["income", "expense"] },
    amount: { type: Number, required: true, min: 0 }, // dollars (or cents if you want)
    category: {
      type: String,
      required: true,
      enum: ["groceries", "rent", "transport", "fun", "utilities", "other"],
    },
    note: { type: String, default: "", maxlength: 200 },
    date: { type: String, required: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
)

export default mongoose.model("Transaction", TransactionSchema);
