import { randomUUID } from "node:crypto";
import type { AlertModel } from "./models.js";

/** Everything needed to create an alert — i.e. an AlertModel minus the generated fields. */
export type NewAlert = Omit<AlertModel, "id" | "createdAt">;

/**
 * In-memory storage. A real app would use a database, but the resolvers
 * wouldn't change — they only see these three methods.
 */
export class AlertStore {
  private alerts = new Map<string, AlertModel>();

  list(): AlertModel[] {
    return [...this.alerts.values()];
  }

  create(input: NewAlert): AlertModel {
    const alert: AlertModel = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  delete(id: string): boolean {
    return this.alerts.delete(id);
  }
}
