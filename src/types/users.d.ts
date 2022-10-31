import { Document } from "mongoose";

export default interface UserType extends Document {
  displayName: string;
  email: string;
  salt: string;
  password: string;
  lastLoginTime: string;
  phoneNumber: string;
  photoUrl: string;
  photoPath: string;
  fcmTokens: {
    web: string;
    android: string;
    ios: string;
  };
  gender: "MALE" | "FEMALE" | "OTHER" | "NONE";
  dateOfBirth: string;
  role: string;
  isLoggedIn: boolean;
  isOnline: boolean;
  blockStatus: "BLOCKED" | "UNBLOCKED";
  role: "ADMIN" | "USER";
  verificationInfo: {
    OTP: number;
    OTPExpiry: Date;
  };
  country?: string;
  geoCode?: {
    LONG: string;
    LAT: string;
  };
  encryptPassword(rawPassword: string): string;
  authenticate(rawPassword: string): boolean;
}
