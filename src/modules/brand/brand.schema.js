import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

//create brand
export const createBrand = joi
  .object({
    name: joi.string().min(2).max(12).required(),
    categories: joi
      .array()
      .items(joi.string().custom(isValidObjectId).required())
      .required(),
  })
  .required();

// update brand
export const updateBrand = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
    name: joi.string().min(2).max(12),
  })
  .required();

// delete brand
export const deleteBrand = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
