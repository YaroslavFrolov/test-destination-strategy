import ivm from "isolated-vm";
import { CustomHTTPerror } from "../infrastructure/error-handlers";
import { getDestinations } from "../infrastructure/destinations";
import { getAppConfig, STRATEGY_PRESETS } from "../infrastructure/app-config";
import { getLogger } from "../infrastructure/logger";
import { TransportService } from "./transport-service";

import type { EventBody } from "../dto/event";
import type { DestinationItem } from "../infrastructure/destinations";
import type { Isolate } from "isolated-vm";

type Result = `${string}: ${"true" | "false"}`;

class EventService {
  private _isolate: Isolate;
  private _transportService: TransportService;

  constructor() {
    /**
     * I realize that we could use kind of DI here,
     * but for now seems redundant.
     */
    this._transportService = new TransportService();
    this._isolate = new ivm.Isolate({ memoryLimit: 8 });
  }

  processingEvent = (event: EventBody) => {
    const destinations = getDestinations();

    const results: Result[] = destinations.map((dest) =>
      this._determineDestination(dest, event)
    );

    const validDestNames = destinations.map((dest) => dest.name);

    const possibleUniqueDestNames = [
      ...new Set(
        event.possibleDestinations.map((intent) => Object.keys(intent)).flat()
      ),
    ];

    // Add invalid user-destination-names to final results.
    possibleUniqueDestNames.forEach((possibleName) => {
      if (!validDestNames.includes(possibleName)) {
        results.push(`${possibleName}: false`);
        getLogger().error(`Unknown destination ${possibleName}`);
      }
    });

    return results;
  };

  private _determineDestination = (
    dest: DestinationItem,
    event: EventBody
  ): Result => {
    const destName = dest.name;
    const strategy = event.strategy || getAppConfig().DEFAULT_STRATEGY;
    const { possibleDestinations, payload } = event;

    const intents = possibleDestinations
      .filter((intent) => typeof intent[destName] === "boolean")
      .map((intent) => intent[destName]);

    if (this._isSend(strategy, intents, possibleDestinations)) {
      this._transportService.executeAsyncSenderJob(dest, payload);
      return `${destName}: true`;
    } else {
      return `${destName}: false`;
    }
  };

  private _isSend = (
    strategy: string,
    intents: boolean[],
    possibleDestinations: EventBody["possibleDestinations"]
  ) => {
    if (intents.length < 1) {
      return false;
    }

    if (strategy === STRATEGY_PRESETS.ALL) {
      return intents.every((intent) => intent) ? true : false;
    }

    if (strategy === STRATEGY_PRESETS.ANY) {
      return intents.some((intent) => intent) ? true : false;
    }

    return this._customStrategy(strategy, possibleDestinations);
  };

  private _customStrategy = (
    stringFn: string,
    possibleDestinations: EventBody["possibleDestinations"]
  ) => {
    const code = `const customStrategy = ${stringFn}; customStrategy(JSON.parse(params));`;

    try {
      const context = this._isolate.createContextSync();
      context.global.setSync("params", JSON.stringify(possibleDestinations));

      const script = this._isolate.compileScriptSync(code);

      const result = script.runSync(context, {
        release: true,
        timeout: 20,
      });

      if (typeof result !== "boolean") {
        throw new Error(
          `Custom strategy should be pure function and return boolean, but return ${typeof result}`
        );
      }

      return result;
    } catch (err) {
      throw new CustomHTTPerror(
        400,
        `Invalid strategy function "${stringFn}", cause: ${err}`
      );
    }
  };
}

export const eventService = new EventService();
