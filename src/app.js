import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

// Middleware global de errores
app.use(errorHandler);

export default app;
