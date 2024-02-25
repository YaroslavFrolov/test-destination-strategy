import express from "express";
import {
  CustomHTTPerror,
  validateRequest,
} from "../infrastructure/error-handlers";
import { register, login } from "../controllers/jwt-controller";
import { loginSchema } from "../dto/login";

const jwtRouter = express.Router();

jwtRouter.route("/register").post(register);
jwtRouter.route("/login").post(validateRequest(loginSchema), login);

jwtRouter.use(() => {
  throw new CustomHTTPerror(404, "Can't find jwt/* route");
});

export default jwtRouter;
