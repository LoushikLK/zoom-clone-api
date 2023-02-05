import { NextFunction, Response } from "express";
import { body, param } from "express-validator";
import { BadRequest } from "http-errors";
import { errorHelper } from "../helpers/error.helper";
import { MessageModel } from "../models/message.model";
import { AuthRequest } from "../types/core";

class MessageController {
  sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      errorHelper(req);

      const userId = req.currentUser?._id;

      //get room id from params

      const roomId = req.params?.roomId;

      //get data from req.body

      const { message, ref } = req.body;

      const messageData = await MessageModel.create({
        message: message,
        ref: ref,
        replyMessage: ref ? true : false,
        sendBy: userId,
        roomId,
      });

      if (!messageData) throw new BadRequest("Message creation failed.");

      res.status(200).json({
        status: "SUCCESS",
        message: "Message saved successfully",
        data: {
          data: messageData,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  validateMessageCreate = [
    body("message").not().isEmpty().withMessage("message is required"),
    param("roomId")
      .not()
      .isEmpty()
      .withMessage("roomId is required")
      .isMongoId()
      .withMessage("enter a valid roomId"),
    body("ref").optional().isMongoId().withMessage("enter a valid ref"),
  ];
}

export default MessageController;
