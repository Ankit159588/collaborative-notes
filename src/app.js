import express from "express";
import morgan from "morgan";
import authRouter from "./router/auth.router.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.get("/test", (req, res) => {
  res.status(200).json({
    message: "App is working fine",
  });
});

app.use("/api/auth", authRouter);

export default app;
