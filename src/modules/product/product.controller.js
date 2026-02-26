import { asyncHandler } from "../../utils/asyncHandler.js";
import { Category } from "./../../../DB/model/category.model.js";
import { Subcategory } from "./../../../DB/model/subcategory.model.js";
import { Brand } from "./../../../DB/model/brand.model.js";
import { nanoid } from "nanoid";
import cloudinary from "./../../utils/cloud.js";
import { Product } from "./../../../DB/model/product.model.js";

//create product
export const createProduct = asyncHandler(async (req, res, next) => {
  // category
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("category not found!", { cause: 404 }));

  // subcategory
  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // brand
  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // check files
  if (!req.files)
    return next(new Error("product images is required !", { cause: 400 }));

  // create folder name
  const cloudFolder = nanoid();

  let images = [];

  // upload sub images\
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}` },
    );
    images.push({ id: public_id, url: secure_url });
  }
  // upload default image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}` },
  );

  //create product
  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user.public_id,
    defaultImage: { url: secure_url, id: public_id },
    images,
  });

  //send res
  return res.json({ success: true, message: "product created successfully" });
});

// delete product
export const deleteProduct = asyncHandler(async (req, res, next) => {
  // check product
  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("product not found !", { cause: 404 }));

  //check owner
  if (req.user._id.toString() != product.createdBy.toString())
    return next(new Error(" not authorized !!", { cause: 401 }));

  //delete product from data base
  await product.deleteOne();

  //delete images
  const ids = product.images.map((image) => image.id);
  ids.push(product.defaultImage.id);

  await cloudinary.api.delete_resources(ids);

  //delete folder
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/products/${product.cloudFolder}`,
  );

  // return res
  return res.json({ success: true, message: "product deleted successfully !" });
});

//get all products
export const allProducts = asyncHandler(async (req, res, next) => {
  const { sort, page, keyword, category, brand, subcategory } = req.query;

  if (category && !(await Category.findById(category)))
    return next(new Error("Category not found !!", { cause: 404 }));

  if (subcategory && !(await Subcategory.findById(subcategory)))
    return next(new Error("Subcategory not found !!", { cause: 404 }));

  if (brand && !(await Brand.findById(brand)))
    return next(new Error("Brand not found !!", { cause: 404 }));

  // sort, paginate,filter, search
  const results = await Product.find({ ...req.query })
    .sort(sort)
    .paginate(page)
    .search(keyword);
  return res.json({ success: true, results });
});
