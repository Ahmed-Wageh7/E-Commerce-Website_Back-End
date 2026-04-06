import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import env from "../../../config/env.service.js";
import Message from "../../database/model/message.model.js";
import User from "../../database/model/user.model.js";

let ioInstance;

const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  ioInstance.on("connection", (socket) => {
    socket.on("authenticate", async (token) => {
      try {
        const payload = jwt.verify(token, env.jwtSecret);
        const user = await User.findById(payload.id);
        if (!user || user.isDeleted) {
          socket.emit("auth-error", { message: "Invalid user" });
          return;
        }

        socket.data.user = {
          id: user._id,
          role: user.role
        };

        socket.emit("authenticated", { message: "Authenticated successfully" });
      } catch (error) {
        socket.emit("auth-error", { message: "Invalid token" });
      }
    });

    socket.on("admin:send-offer", async (payload) => {
      if (!socket.data.user || socket.data.user.role !== "admin") {
        socket.emit("socket-error", { message: "Only admins can send offers" });
        return;
      }

      const message = await Message.create(payload);
      ioInstance.emit("user:receive-offer", message);
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

export {
  initializeSocket,
  getIO
};
