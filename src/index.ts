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
    this.routes();
    this.listen();
    this.io = new SocketServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.socketConnection();
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
    this.express.listen(this.PORT, () => {
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
        socket.on("user-connected", (userData) => {
          onlineUsers.set(userData?._id, socket.id);
          socket.join(userData?._id);
        });

        socket.on("create-offer", (userData) => {});

        socket.on("join-call", (userData) => {});
      });
    } catch (error) {
      console.log(error);
    }
  }
}
export default new App();
