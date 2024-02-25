import bcrypt from "bcrypt";
import { CustomHTTPerror } from "../infrastructure/error-handlers";
import { generateToken } from "../infrastructure/jwt-utils";

import type { Request, Response, NextFunction } from "express";
import type { LoginPayload } from "../dto/login";

export const register = (request: Request, response: Response) => {
  response.send({
    message: "@todo - implement registration",
  });
};

export const login = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { name, password } = request.body as LoginPayload;

  /**
   * Did not have much time implement db-table with users
   * and with registration flow.
   *
   * So let's imagine that we got these user-name
   * and hashed-user-password from db..)
   */
  const USER_NAME = "admin";
  const USER_PASS_HASH =
    "$2b$10$h.7RuXSySiWNg4ASDXbXkuMGsX5f9g.OdtGd2vQPJX4GW.JRt6lD6";

  const isValidPassword = await bcrypt.compare(password, USER_PASS_HASH);

  if (name.toLowerCase() !== USER_NAME || !isValidPassword) {
    return next(
      new CustomHTTPerror(401, "Invalid credentials or user was not found.")
    );
  }

  let token = null;
  try {
    token = generateToken(USER_NAME);
  } catch (err) {
    return next(err);
  }

  response.send({
    token,
  });
};
