import { model, Model, Schema } from "mongoose";
import RoomType from "../types/room";

const roomSchema = new Schema<RoomType, Model<RoomType>>(
  {
    createBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    joinedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
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
        ref: "Users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const RoomModel = model<RoomType>("Room", roomSchema);
