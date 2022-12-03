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
      "/room/private/join/:roomId/:userId",
      this.isAuthenticated,
      this.roomController.joinRoomValidate,
      this.roomController.joinPrivateRoom
    );
    this.router.put(
      "/room/join/:roomId",
      this.isAuthenticated,
      this.roomController.joinPublicRoomValidate,
      this.roomController.joinPublicRoom
    );
    this.router.put(
      "/room/private/wait/:roomId",
      this.isAuthenticated,
      this.roomController.waitingPrivateRoomValidate,
      this.roomController.waitingRoom
    );
    this.router.put(
      "/room/remove/:roomId/:userId",
      this.isAuthenticated,
      this.roomController.removeRoomValidation,
      this.roomController.removeRoom
    );
    this.router.put(
      "/room/reject/:roomId/:userId",
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
  }
}

export default roomRoute;
