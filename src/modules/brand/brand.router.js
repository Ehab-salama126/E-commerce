import { Router } from "express";
import * as brandController from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";
import { isAuthenticated } from "./../../../src/middleware/authentication.middleware.js";
import { isAuthorized } from "./../../../src/middleware/authorization.middleware.js";
import { fileUpload } from "./../../utils/fileUpload.js";
import { validation } from "./../../middleware/validation.middleware.js";

const router = Router();

/// create brand
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.createBrand),
  brandController.createBrand,
);

/// update brand
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.updateBrand),
  brandController.updateBrand,
);

/// delete brand
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(brandSchema.deleteBrand),
  brandController.deleteBrand,
);

//get all brands
router.get("/", brandController.getBrands);

export default router;
