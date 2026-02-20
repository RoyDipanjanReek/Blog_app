import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [50, "Name can not exceed 50 charecter."],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be atleast 8 charecter."],
      select: false,
    },
    avater: {
      type: String,
      default: "default-avater.png",
    },
    bio: {
      type: String,
      maxLength: [200, "Bio can not exceed 200 charceter"],
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Hashed password befour saving
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(password, enteredPassword);
};

// Generate password reset token
userSchema.methods.getResetPassword = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
