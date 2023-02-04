import { Document } from "mongoose";
import UserType from "./users";

export default interface RoomType extends Document {
  title: string;
  createBy: UserType;
  roomType: "PRIVATE" | "PUBLIC";
}
