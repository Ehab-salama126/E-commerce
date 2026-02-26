import { Cart } from "../../../DB/model/cart.model.js";
import { Coupon } from "../../../DB/model/coupon.model.js";
import { Product } from "../../../DB/model/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import { Order } from "./../../../DB/model/order.model.js";
import createInvoice from "./../../utils/pdfInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "./../../utils/sendEmail.js";
import { updateStock, clearCart } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asyncHandler(async (req, res, next) => {
  //data
  const { payment, address, coupon, phone } = req.body;

  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
  }

  if (!checkCoupon) return next(new Error("Invalid Coupon !", { cause: 400 }));

  //get products from cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty Cart !"));

  //check products
  let orderProducts = [];
  let orderPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`${products[i].productId} product not found !`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `product out stock, Only ${product.availableItems} are available `,
        ),
      );
    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });
    orderPrice += product.finalPrice * products[i].quantity;
  }

  //create order in db
  const order = await Order.create({
    user: req.user._id,
    address,
    phone,
    payment,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });

  //create invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);
  createInvoice(invoice, pdfPath);

  //upload cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUD_FOLDER_NAME}/order/invoices`,
  });

  //add invoice in the db
  order.invoice = { url: secure_url, id: public_id };
  await order.save();

  // send email to user (invoice)
  const isSent = await sendEmail({
    to: user.email,
    subject: "order invoice",
    attachments: [{ path: secure_url, contentType: "proOne/pdf" }],
  });
  if (!isSent) return next(new Error("something went Wrong !"));

  //update stock
  updateStock(order.products, true);
  //clear cart
  clearCart(user._id);

  // visa (stripe)
  if (payment === "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    // coupon stripe
    let couponExisted;
    if (order.coupon.name !== undefined) {
      couponExisted = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url],
            },

            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExisted ? [{ coupon: couponExisted.id }] : [],
    });
    return res.json({ success: true, results: { url: session.url } });
  }

  //send res
  return res.json({ success: true, results: { order } });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  //check order
  const order = await Order.findById(req.params.id);
  if (!order) return next(new Error("Invalid order id !", { cause: 400 }));

  //check status
  if (!order.status === "placed")
    return next(new Error("can not cancel the order !"));

  //cancel order
  order.status = "canceled";
  await order.save();

  //update stock
  updateStock(order.products, false);

  // send res
  return res.json({ success: true, message: "order canceled !" });
});
