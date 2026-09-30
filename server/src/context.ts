import type { AlertStore } from "./data/alert-store.js";
import type { PriceService } from "./data/price-service.js";

/**
 * The context object is built once per request and handed to every resolver
 * as its 3rd argument. It's the place for shared services, the current user, etc.
 */
export interface AppContext {
  prices: PriceService;
  alerts: AlertStore;
}
