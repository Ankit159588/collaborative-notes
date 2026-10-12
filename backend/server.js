import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";
import setupNoteSocket from "./src/socket/note.socket.js";
import dns from "dns";

dns.setServers(["1.1.1.1", "0.0.0.0"]);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
});

setupNoteSocket(io);

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(config.PORT, () => {
      console.log(`Server is Started on Port ${config.PORT}`);
    });
  } catch (error) {
    console.log("Failed to start the server:", error.message);
    process.exit(1);
  }
}

startServer();
