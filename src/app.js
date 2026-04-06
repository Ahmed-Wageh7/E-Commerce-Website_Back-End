import express from "express";
import cors from "cors";
import helmet from "helmet";

import appRouter from "./app.controller.js";
import { notFound, errorHandler } from "./middleware/error-handler.js";
import { sanitizePayload } from "./middleware/sanitize.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buffer) => {
      if (req.originalUrl === "/api/v1/orders/stripe/webhook") {
        req.rawBody = buffer;
      }
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(sanitizePayload);

app.use("/api/v1", appRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
