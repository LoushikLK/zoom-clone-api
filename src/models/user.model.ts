import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import UserType from "../types/users";
const crypto = require("crypto");

const userSchema = new Schema<UserType>(
  {
    displayName: {
      type: String,
      required: true,
    },
    phoneNumber: Number,
    photoUrl: String,
    photoPath: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: "String",
      enum: ["MALE", "FEMALE", "OTHER", "NONE"],
      default: "NONE",
    },
    password: String,
    salt: String,
    dateOfBirth: String,
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    fcmTokens: {
      web: String,
      android: String,
      ios: String,
    },
    isLoggedIn: Boolean,
    isOnline: Boolean,
    blockStatus: {
      type: String,
      enum: ["BLOCKED", "UNBLOCKED"],
      default: "UNBLOCKED",
    },
    verificationInfo: {
      OTP: Number,
      OTPExpiry: Date,
    },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this.salt = uuidv4();
    this.password = this.encryptPassword(password);
  })
  .get(function () {
    return this.password;
  });

userSchema.methods.authenticate = function (rawPassword: string) {
  return this.encryptPassword(rawPassword) === this.password;
};
userSchema.methods.encryptPassword = function (rawPassword: string) {
  if (!rawPassword) {
    return "";
  }
  try {
    return crypto
      .createHash("sha256", this.salt)
      .update(rawPassword)
      .digest("hex");
  } catch (error) {
    console.log("password encryption error:", error);
    return "";
  }
};

export const UserModel = model<UserType>("User", userSchema);
