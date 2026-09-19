import { Router } from "express";
import * as controller from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/verify-email", controller.verifyEmail);
authRouter.post("/resend-otp", controller.resendOtp);
authRouter.get("/logout", controller.logout);
authRouter.get("logout-all", controller.logoutAll);

authRouter.post("/forgot-password", controller.forgotPassword);
authRouter.post("/verify-reset-otp", controller.verifyResetOtp);
authRouter.post("/reset-password", controller.resetPassword);

export default authRouter;
