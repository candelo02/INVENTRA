import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import testRoutes from "./routes/testRoutes.js";

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

app.use(express.json());

// 🌐 Ruta de prueba para el navegador
app.get("/", (req, res) => {
  res.send({
    status: "API en ejecución",
    database: "Conectada a MongoDB Atlas",
    endpoints: {
      auth: "/api/v1/auth",
      snippets: "/api/v1/snippets (si existen)"
    },
    message: "¡Hola! Si ves esto, el backend está funcionando correctamente."
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes);

// Middleware global de errores
app.use(errorHandler);

export default app;
