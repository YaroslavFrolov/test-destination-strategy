import express from "express";
import { test as controllerTest } from "../controllers/test-controller";
import { event as controllerEvent } from "../controllers/event-controller";
import {
  CustomHTTPerror,
  validateRequest,
} from "../infrastructure/error-handlers";
import { validateToken } from "../infrastructure/jwt-utils";
import { eventSchema } from "../dto/event";

const apiRouter = express.Router();

apiRouter.use(validateToken);

apiRouter.route("/test").get(controllerTest);
apiRouter.route("/event").post(validateRequest(eventSchema), controllerEvent);

apiRouter.use(() => {
  throw new CustomHTTPerror(404, "Can't find api/* route");
});

export default apiRouter;
