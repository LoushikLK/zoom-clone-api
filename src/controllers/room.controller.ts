import { NextFunction, Response } from "express";
import { body, param } from "express-validator";
import { BadRequest, NotFound } from "http-errors";
import { errorHelper } from "../helpers/error.helper";
import { RoomModel } from "../models/room.model";
import { AuthRequest } from "../types/core";

class RoomController {
  createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const userId = req.currentUser?._id;

      const { roomType } = req?.body;

      const roomCreated = await RoomModel.create({
        createBy: userId,
        joinedUsers: [userId],
        roomType: roomType,
      });

      if (!roomCreated) throw new BadRequest("Room creation failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Room created successfully",
        data: {
          data: roomCreated,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  joinPrivateRoom = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { userId, roomId } = req?.params;

      //find and update room

      const joinRoom = await RoomModel.findOneAndUpdate(
        { _id: roomId, joinedUsers: { $nin: [userId] } },
        {
          createBy: user,
          $push: { joinedUsers: userId },
        }
      );

      if (!joinRoom) throw new BadRequest("Room join failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Room joined successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  joinPublicRoom = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId } = req?.params;

      //find and update room

      const joinRoom = await RoomModel.findOneAndUpdate(
        { _id: roomId, roomType: "PUBLIC" },
        {
          $push: { joinedUsers: user },
        }
      );

      if (!joinRoom) throw new BadRequest("Room join failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Room joined successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  waitingRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId } = req?.params;

      //find and update room

      const waitRoom = await RoomModel.findOneAndUpdate(
        { _id: roomId, joinedUsers: { $nin: [user] } },
        {
          $push: { waitingUsers: user },
        }
      );

      if (!waitRoom) throw new BadRequest("Room join failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Waiting in room successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  joinRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      let joined = false;
      let waiting = false;

      const user = req?.currentUser?._id;

      const { roomId } = req?.params;

      //find the room
      const room = await RoomModel.findById(roomId);

      if (!room) throw new NotFound("Room not found");

      //check if already exist in the room

      let exist = room?.joinedUsers?.find((item) => {
        return String(item) === String(user);
      });

      if (!exist) {
        //check if the the room is private or public

        if (room?.roomType === "PRIVATE") {
          room.waitingUsers.push(user as any);
          joined = true;
        } else if (room?.roomType === "PUBLIC") {
          room.joinedUsers.push(user as any);
          waiting = true;
        } else {
          throw new BadRequest("Room joined failed");
        }
      } else {
        joined = true;
      }

      await room.save();

      res.status(200).json({
        status: "SUCCESS",
        message: "Room joined successfully",
        data: {
          data: {
            room,
            joined,
            waiting,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
  removeRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId, userId } = req?.params;

      //find and update room

      const waitRoom = await RoomModel.findByIdAndUpdate(roomId, {
        createdBy: user,
        $pull: {
          joinedUsers: { $elemMatch: userId },
        },
      });

      if (!waitRoom) throw new BadRequest("Remove from room failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Remove from room successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  rejectRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId, userId } = req?.params;

      //find and update room

      const waitRoom = await RoomModel.findByIdAndUpdate(roomId, {
        createdBy: user,
        $pull: {
          waitingUsers: { $elemMatch: userId },
        },
      });

      if (!waitRoom) throw new BadRequest("Request reject failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "User rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId } = req?.params;

      //find and update room

      const waitRoom = await RoomModel.findOneAndDelete({
        _id: roomId,
        createBy: user,
      });

      if (!waitRoom) throw new BadRequest("Room delete failed");

      res.status(200).json({
        status: "SUCCESS",
        message: "Deleting room successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  getRoomData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const user = req?.currentUser?._id;

      const { roomId } = req?.params;

      //find and update room

      const roomData = await RoomModel.findOne({
        _id: roomId,
        joinedUsers: { $elemMatch: user },
      }).populate("createdBy joinedUser");

      if (!roomData) throw new BadRequest("No data found");

      res.status(200).json({
        status: "SUCCESS",
        message: "Room data found  successfully",
        data: {
          data: roomData,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createRoomValidation = [
    body("roomType")
      .optional()
      .custom((value) => {
        if (["PUBLIC", "PRIVATE"].includes(value)) {
          return true;
        } else {
          return false;
        }
      })
      .withMessage("Room type cam only be PUBLIC or PRIVATE"),
  ];

  joinRoomValidate = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Enter a valid id"),
    param("userId")
      .not()
      .isEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Enter a valid  user id"),
  ];

  joinAllRoomValidation = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Enter a valid id"),
  ];

  joinPublicRoomValidate = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Enter a valid id"),
  ];
  waitingPrivateRoomValidate = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Enter a valid id"),
  ];
  removeRoomValidation = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Invalid room Id"),
    param("userId")
      .not()
      .isEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Invalid user Id"),
  ];
  rejectRoomValidation = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Invalid room Id"),
    param("userId")
      .not()
      .isEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Invalid user Id"),
  ];
  deleteRoomValidation = [
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("Room id is required")
      .isMongoId()
      .withMessage("Invalid room Id"),
  ];
}

export default RoomController;
