import fetch from "node-fetch";
import { getLogger } from "../infrastructure/logger";

import type { EventBody } from "../dto/event";
import type { DestinationItem } from "../infrastructure/destinations";

export const TRANSPORT_TYPES = {
  GET: "http.get",
  POST: "http.post",
  PUT: "http.put",
  LOG: "console.log",
  WARN: "console.warn",
} as const;

type Transport = (typeof TRANSPORT_TYPES)[keyof typeof TRANSPORT_TYPES];

type Transports = Record<
  Transport,
  (payload: string, url: string) => Promise<unknown>
>;

export class TransportService {
  private _transports: Transports;

  constructor() {
    this._transports = {
      [TRANSPORT_TYPES.GET]: (payload, url) => {
        const addr = new URL(url);

        addr.searchParams.set("payload", payload);

        return fetch(addr.href).finally(() => {
          getLogger().info(`GET ${url}`);
        });
      },

      [TRANSPORT_TYPES.POST]: (payload, url) => {
        const addr = new URL(url);

        return fetch(addr.href, {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
        }).finally(() => {
          getLogger().info(`POST ${url}`);
        });
      },

      [TRANSPORT_TYPES.PUT]: (payload, url) => {
        const addr = new URL(url);

        return fetch(addr.href, {
          method: "PUT",
          body: payload,
          headers: { "Content-Type": "application/json" },
        }).finally(() => {
          getLogger().info(`PUT ${url}`);
        });
      },

      [TRANSPORT_TYPES.LOG]: (payload) =>
        Promise.resolve(console.log(payload)).then(() => {
          getLogger().info(`LOG ${payload}`);
        }),

      [TRANSPORT_TYPES.WARN]: (payload) =>
        Promise.resolve(console.warn(payload)).then(() => {
          getLogger().info(`WARN ${payload}`);
        }),
    };
  }

  executeAsyncSenderJob = async (
    dest: DestinationItem,
    payload: EventBody["payload"]
  ) => {
    const senderJob = this._transports[dest.transport as Transport];

    if (!senderJob) {
      return Promise.reject("Could not find valid transport");
    }

    const payloadString = JSON.stringify(payload);
    const url = dest.url || ""; // Existence of url is already checked at start of app

    senderJob(payloadString, url);
  };
}
