import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      maxLength: [50, "Content can not exceed 50 charecter."],
    },
    image: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Post = mongoose.model("Post", postSchema);
