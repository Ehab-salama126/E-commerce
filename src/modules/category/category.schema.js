import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCategory = joi
  .object({
    name: joi.string().min(5).max(20).required(),
  })
  .required();

export const updateCategory = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
    name: joi.string().min(5).max(20),
  })
  .required();

export const deleteCategory = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
