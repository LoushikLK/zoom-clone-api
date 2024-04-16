import { Router } from "express";
import RoomController from "../controllers/room.controller";
import AuthMiddleware from "../middleware/auth.middleware";

class roomRoute extends AuthMiddleware {
  public router: Router;
  private roomController: RoomController;

  constructor() {
    super();
    this.router = Router();
    this.roomController = new RoomController();
    this.roomRoute();
  }

  private roomRoute() {
    this.router.post(
      "/room/create",
      this.isAuthenticated,
      this.roomController.createRoomValidation,
      this.roomController.createRoom
    );
    this.router.put(
      "/room/:roomId",
      this.isAuthenticated,
      this.roomController.joinPublicRoomValidate,
      this.roomController.updateRoom
    );
    this.router.put(
      "/room/private/join/:roomId/:userId",
      this.isAuthenticated,
      this.roomController.joinRoomValidate,
      this.roomController.joinPrivateRoom
    );
    this.router.put(
      "/room/join/:roomId",
      this.isAuthenticated,
      this.roomController.joinPublicRoomValidate,
      this.roomController.joinARoom
    );

    this.router.put(
      "/room/remove/:roomId/:userId",
      this.isAuthenticated,
      this.roomController.removeRoomValidation,
      this.roomController.removeRoom
    );
    this.router.put(
      "/room/leave/:roomId",
      this.isAuthenticated,
      this.roomController.joinPublicRoomValidate,
      this.roomController.leaveRoom
    );
    this.router.delete(
      "/room/private/join/:roomId/:userId",
      this.isAuthenticated,
      this.roomController.rejectRoomValidation,
      this.roomController.rejectRequest
    );
    this.router.delete(
      "/room/delete/:roomId",
      this.isAuthenticated,
      this.roomController.deleteRoomValidation,
      this.roomController.deleteRoom
    );
    this.router.get(
      "/room/random",
      this.isAuthenticated,
      this.roomController.getRandomRoom
    );
    this.router.get(
      "/room/:roomId",
      this.isAuthenticated,
      this.roomController.getRoomData
    );

    this.router.post(
      "/room/:roomId/token",
      this.isAuthenticated,
      this.roomController.createAgoraToken
    );
  }
}

export default roomRoute;
