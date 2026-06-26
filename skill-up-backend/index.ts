import express from "express";
import dotenv from 'dotenv'
import cors from "cors";
import { connectDB } from "./config/database.config";
import cookieParser from 'cookie-parser';
import { routes } from "./routers/index.route";
const app = express();
const port = 4000;

//Config dotenv
dotenv.config();

//Config Cors
app.use(
  cors({
    origin: "http://localhost:3000",
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

// Routes
routes(app);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

// trigger nodemon restart 2
