import { Router } from "express";
import MessageController from "../controllers/message.controller";
import AuthMiddleware from "../middleware/auth.middleware";

class messageRoute extends AuthMiddleware {
  private messageController: MessageController;
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.messageController = new MessageController();
    this.messageRoute();
  }

  private messageRoute() {
    this.router.post(
      "/send-message/:roomId",
      this.isAuthenticated,
      this.messageController.validateMessageCreate,
      this.messageController.sendMessage
    );
  }
}

export default messageRoute;
