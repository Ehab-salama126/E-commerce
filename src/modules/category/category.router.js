import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import { validation } from "./../../middleware/validation.middleware.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.schema.js";
import { fileUpload } from "../../utils/fileUpload.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js";

const router = Router();

//localhost: 3000/category
router.use("/:category/subcategory", subcategoryRouter);

// create category
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.createCategory),
  categoryController.createCategory,
);

//update category
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.updateCategory),
  categoryController.updateCategory,
);

//delete category
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(categorySchema.deleteCategory),
  categoryController.deleteCategory,
);

//get all category
router.get("/", categoryController.allCategories);

export default router;
