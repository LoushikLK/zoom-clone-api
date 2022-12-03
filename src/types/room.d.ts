import { Document } from "mongoose";
import UserType from "./users";

export default interface RoomType extends Document {
  createBy: UserType;
  joinedUsers: UserType[];
  roomType: "PRIVATE" | "PUBLIC";
  waitingUsers: UserType[];
}
