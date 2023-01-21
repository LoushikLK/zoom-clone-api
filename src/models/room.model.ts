import { Model, Schema, model } from "mongoose";
import RoomType from "../types/room";

const roomSchema = new Schema<RoomType, Model<RoomType>>(
  {
    createBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    joinedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roomType: {
      type: String,
      required: true,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PUBLIC",
    },
    waitingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const RoomModel = model<RoomType>("Room", roomSchema);
