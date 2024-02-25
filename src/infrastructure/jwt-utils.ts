import jwt from "jsonwebtoken";
import { CustomHTTPerror } from "./error-handlers";
import { getAppConfig } from "./app-config";

import type { Request, Response, NextFunction } from "express";

const options = { expiresIn: "1h", issuer: "Yaroslav" };

export const generateToken = (userName: string) => {
  const payload = { user: userName };
  return jwt.sign(payload, getAppConfig().JWT_SECRET, options);
};

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeaader = req.headers.authorization;
  const token = authorizationHeaader?.split(" ")[1];

  if (!token) {
    throw new CustomHTTPerror(
      401,
      "Authorization header with Bearer token required"
    );
  }

  try {
    jwt.verify(token, getAppConfig().JWT_SECRET, options);
    next();
  } catch (error) {
    throw new CustomHTTPerror(401, "Token invalid or expired");
  }
};
