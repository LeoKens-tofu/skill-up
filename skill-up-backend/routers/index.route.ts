import { Express } from "express";
import { clientRoutes } from "./client/index.route";

export const routes = (app: Express) => {
  app.use("/api/client", clientRoutes);
};
