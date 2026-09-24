import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import noteRouter from "./router/note.router.js";
import noteshareRouter from "./router/noteshare.router.js";
import authRouter from "./router/auth.router.js";
import imageRouter from "./router/image.router.js";

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);
app.use("/api/image", imageRouter);
app.use("/api/share", noteshareRouter);

export default app;
