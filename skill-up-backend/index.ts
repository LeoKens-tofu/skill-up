import express from "express";
import http from "http";
import dotenv from 'dotenv'
import cors from "cors";
import { connectDB } from "./config/database.config";
import cookieParser from 'cookie-parser';
import { routes } from "./routers/index.route";
import { UPLOAD_ROOT } from "./config/upload.config";
import { initSocket } from "./sockets";
const app = express();
const port = 4000;

//Config dotenv
dotenv.config();

//Config Cors
app.use(
  cors({
    origin: ["http://localhost:3000", "https://mindmaster.click", "https://www.mindmaster.click"],
    credentials: true
  })
);

//Config cookies
app.use(cookieParser());

//Connect Database
connectDB();

//Connect Redis
import { connectRedis } from "./config/redis.config";
connectRedis();

//Allow json
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//Serve uploaded files (video/tài liệu/ảnh bìa khóa học)
app.use("/api/uploads", express.static(UPLOAD_ROOT));

// Routes
routes(app);

// HTTP server + Socket.io (chat nhóm realtime)
const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

// trigger nodemon restart 2
