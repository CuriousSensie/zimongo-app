import { Server } from "socket.io";
import http from "http";
import { Http2Server } from "http2";
import toggleUserOnline from "../service/onlineUser";

export const activeOnlineUser = new Set();

export class SocketServer {
  io: Server;

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          // Allow localhost and subdomain requests
          if (
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.includes("lvh.me")
          ) {
            return callback(null, true);
          }

          // Allow production and staging domains
          if (
            origin.includes("zimongo.com") ||
            origin.includes("zimongo-staging.com") ||
            origin.includes("zimongo-app.vercel.app") ||
            origin.includes(".vercel.app")
          ) {
            return callback(null, true);
          }

          // Allow storage app domains
          if (origin.includes("amazonaws.com")) {
            return callback(null, true);
          }

          callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;

      if (userId) {
        toggleUserOnline(userId.toString(), true);
        socket.join(userId.toString());
      }

      this.io.emit("online-user", [...activeOnlineUser]);

      socket.on("disconnect", () => {
        if (userId) {
          toggleUserOnline(userId.toString(), false);
        }
      });
    });
  }
}
