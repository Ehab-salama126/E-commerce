import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "./../../utils/cloud.js";
import { Category } from "./../../../DB/model/category.model.js";
import slugify from "slugify";

export const createCategory = asyncHandler(async (req, res, next) => {
  //check file
  if (!req.file)
    return next(new Error("Category image is required !", { cause: 404 }));
  //upload image in cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_FOLDER_NAME}/category` },
  );
  //save category in DB
  await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
  });
  //return response
  return res.json({ success: true, message: "category created successfully" });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  // check category in database
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("category not found", { cause: 404 }));

  // check category owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("you must be owner to update category"));

  // check file and upload it in cloudinary
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: category.image.id },
    );
    category.image = { id: public_id, url: secure_url };
  }

  // update category
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  // save category
  await category.save();

  // return response
  return res.json({
    success: true,
    message: "category updated successfully !",
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  // check category in database
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  // check category owner
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(new Error("you must be owner to delete category !"));

  // delete category from database
  await category.deleteOne();
  // delete image from cloudinary
  await cloudinary.uploader.destroy(category.image.id);
  //return response
  return res.json({ success: true, message: "category deleted successfully" });
});

export const allCategories = asyncHandler(async (req, res, next) => {
  const results = await Category.find().populate("subcategory");
  return res.json({ success: true, results });
});
