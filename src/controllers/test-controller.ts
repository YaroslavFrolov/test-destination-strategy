import type { Request, Response } from "express";

export const test = (request: Request, response: Response) => {
  response.send({
    message: "hello api",
  });
};
