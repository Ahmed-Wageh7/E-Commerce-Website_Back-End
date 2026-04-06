import express from "express";

import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/users/users.controller.js";
import categoryController from "./modules/categories/categories.controller.js";
import subcategoryController from "./modules/subcategories/subcategories.controller.js";
import productController from "./modules/products/products.controller.js";
import cartController from "./modules/cart/cart.controller.js";
import orderController from "./modules/orders/orders.controller.js";
import staffController from "./modules/staff/staff.controller.js";
import attendanceController from "./modules/attendance/attendance.controller.js";
import deductionController from "./modules/deductions/deductions.controller.js";
import ticketController from "./modules/tickets/tickets.controller.js";

const appRouter = express.Router();

appRouter.use("/auth", authController);
appRouter.use("/users", userController);
appRouter.use("/categories", categoryController);
appRouter.use("/subcategories", subcategoryController);
appRouter.use("/", productController);
appRouter.use("/cart", cartController);
appRouter.use("/", orderController);
appRouter.use("/", staffController);
appRouter.use("/", attendanceController);
appRouter.use("/", deductionController);
appRouter.use("/", ticketController);

export default appRouter;
