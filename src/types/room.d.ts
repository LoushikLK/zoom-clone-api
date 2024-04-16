import { Document, ObjectId } from "mongoose";

export default interface RoomType extends Document {
  title: string;
  createBy: ObjectId;
  roomType: "PRIVATE" | "PUBLIC" | "RANDOM";
  joinedUsers: ObjectId[];
  waitingUsers: ObjectId[];
  admin: ObjectId;
}
