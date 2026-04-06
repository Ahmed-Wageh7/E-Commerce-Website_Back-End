import http from "http";

import env from "../config/env.service.js";
import app from "./app.js";
import connectDB from "./database/connection.js";
import { initializeSocket } from "./modules/socket/socket.service.js";

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
