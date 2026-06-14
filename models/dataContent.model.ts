import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7, // 7 days in seconds
  },
});

export const Content =
  mongoose.models.Content || mongoose.model("Content", contentSchema);
