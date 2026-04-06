import express from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import categoryRoutes from "./modules/categories/categories.routes.js";
import subcategoryRoutes from "./modules/subcategories/subcategories.routes.js";
import productRoutes from "./modules/products/products.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/orders.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import deductionRoutes from "./modules/deductions/deductions.routes.js";
import ticketRoutes from "./modules/tickets/tickets.routes.js";

const appRouter = express.Router();

appRouter.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/categories", categoryRoutes);
appRouter.use("/subcategories", subcategoryRoutes);
appRouter.use("/", productRoutes);
appRouter.use("/cart", cartRoutes);
appRouter.use("/", orderRoutes);
appRouter.use("/", staffRoutes);
appRouter.use("/", attendanceRoutes);
appRouter.use("/", deductionRoutes);
appRouter.use("/", ticketRoutes);

export default appRouter;
