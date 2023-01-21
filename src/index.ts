import cookiesParser from "cookie-parser";
import cors from "cors";
import express from "express";
import uploader from "express-fileupload";
import fs from "fs";
import { createServer, Server } from "http";
import mongoose from "mongoose";
import path from "path";
import { Server as SocketServer } from "socket.io";
require("dotenv").config();

class App {
  public express: express.Application;
  private PORT = process.env.PORT || 8000;
  private server: Server;
  private io: SocketServer;

  constructor() {
    this.express = express();
    this.server = createServer(this.express);
    this.connectDB();
    this.middleware();
    this.io = new SocketServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.routes();
    this.socketConnection();
    this.listen();
  }

  private middleware(): void {
    this.express.use(cors());
    this.express.use(cookiesParser());
    this.express.use(express.json());
    this.express.use(
      uploader({
        useTempFiles: true,
      })
    );
    this.express.use((req, res, next) => {
      console.table([
        {
          METHOD: req.method,
          PATH: req.path,
          ip: req.ip,
          AGENT: req?.get("user-agent")?.split("/")[0],
        },
      ]);
      next();
    });
  }

  //   DB connection
  private connectDB(): void {
    mongoose
      .connect(process.env.MONGODB_URI || "", {})
      .then(() => {
        console.log("DB connected");
      })
      .catch((err) => {
        console.log("DB connection error:", err.message);
      });
  }

  public listen(): void {
    this.server.listen(this.PORT, () => {
      console.log(`Server started on port ${this.PORT}`);
    });
  }

  private routes(): void {
    //read files from routes folder
    const allFiles = fs.readdirSync(path.join(__dirname, "/routes"));
    // import all files from routes folder
    allFiles.forEach((file, index) => {
      // load all routes
      if (file.includes(".route.")) {
        import(path.join(__dirname + "/routes/" + file)).then((route) => {
          this.express.use("/api/v1", new route.default().router);
        });
      }
      // not found route
      if (allFiles.length - 1 === index) {
        import(
          path.join(__dirname + "/middleware/errorHandler.middleware")
        ).then((errorHandler) => {
          new errorHandler.default(this.express);
        });
      }
    });
  }

  private socketConnection() {
    try {
      let onlineUsers = new Map();

      this.io.on("connection", (socket) => {
        socket.on("user-connected", (userId) => {
          onlineUsers.set(userId, socket.id);
        });

        socket.on("user-added-to-room", (data) => {
          const userSocket = onlineUsers?.get(data?.userId);
          if (userSocket) {
            socket.to(data?.roomId).emit("new-user-added", {
              message: "New user joined",
              userId: data?.userId,
            });
            socket.to(userSocket).emit("room-joined", {
              message: `You joined to the room ${data?.roomId}`,
              roomId: data?.roomId,
            });
          }
        });

        socket.on("join-waiting-room", (data) => {
          socket
            .to(data?.roomId)
            .emit("user-added-to-waiting", { userId: data?.userId });
        });

        socket.on("user-rejected", (data) => {
          const userSocket = onlineUsers?.get(data?.userId);
          socket.to(userSocket).emit("room-rejected", { roomId: data?.roomId });
        });
        socket.on("join-new-room", (data) => {
          socket.join(data?.roomId);
          socket.to(data?.roomId).emit("user-joined", {
            userId: data?.userId,
            peerData: data?.peerData,
            candidate: data?.candidate,
          });
        });

        socket.on("exchange-peer", (data) => {
          socket
            .to(data?.roomId)
            .emit("peer-data", {
              peerData: data?.peerData,
              candidate: data?.candidate,
            });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
export default new App();
