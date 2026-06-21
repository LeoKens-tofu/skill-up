import express from "express";
import dotenv from 'dotenv'
import cors from "cors";
import { connectDB } from "./config/database.config";
import cookieParser from 'cookie-parser';
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

//Allow json
app.use(express.json());


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
