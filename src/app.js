import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import morgan from "morgan";
import xssClean from "xss-clean";

import corsOptions from "./utils/corsOptions.js";
import notFoundErrorHandler from "./middlewares/notFoundErrorHandler.js";
import otherErrorHandler from "./middlewares/otherErrorHandler.js";
import { limiter } from "./utils/limiter.js";

// routes import
import { seedRouter, authRouter, userRouter, productRouter, categoryRouter, cartRouter, orderRouter } from "./routes/index.js";

const app = express();
const swaggerDocument = yaml.load(fs.readFileSync("swagger.yaml", "utf-8"));

app.use(hpp());
app.use(xssClean());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

// routes declaration
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/seed", seedRouter);
app.use("/api/v1/auth", limiter, authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: '✅ ok',
    uptime: process.uptime(), // Current uptime of the Node.js process
    message: '🚀 API is healthy'
  });
});

app.use("*", notFoundErrorHandler);
app.use(otherErrorHandler);

export default app;
