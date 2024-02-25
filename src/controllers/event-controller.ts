import { eventService } from "../services/event-service";
import { getLogger } from "../infrastructure/logger";

import type { Request, Response } from "express";
import type { EventBody } from "../dto/event";

export const event = (request: Request, response: Response) => {
  const { payload, strategy, possibleDestinations } = request.body as EventBody; // already valid body

  getLogger().info(request.body, "REQUEST_EVENT");

  const result = eventService.processingEvent({
    payload,
    strategy,
    possibleDestinations,
  });

  getLogger().info(result, "RESPONSE_DATA");

  response.send(result);
};
