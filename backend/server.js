import dotenv from "dotenv";
dotenv.config();

import Hapi from "@hapi/hapi";
import { AppDataSource } from "./src/config/database.js";
import authRoutes from './src/routes/authRoutes.js';
import hrInitiationRoutes from './src/routes/hrInitiationRoutes.js';
import assessmentRoutes from './src/routes/assessmentRoutes.js';
import skillMatrixRoutes from "./src/routes/skillMatrixRoutes.js";

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.SERVER_HOST || "localhost",
  });

  server.route(authRoutes);
  server.route(hrInitiationRoutes);
  server.route(assessmentRoutes);
  server.route(skillMatrixRoutes);
  try {
    await AppDataSource.initialize();
    console.log("Data Source initialized");
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  } catch (error) {
    console.error("Failed to initialize Data Source or start server:", error);
  }
};

init();
