import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "./../../../DB/model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "./../../utils/sendEmail.js";
import { signUpTemp } from "../../utils/htmlTemplate.js";
import { resetPassTemp } from "../../utils/htmlTemplate.js";

import { Token } from "./../../../DB/model/token.model.js";
import Randomstring from "randomstring";
import { Cart } from "./../../../DB/model/cart.model.js";

export const register = asyncHandler(async (req, res, next) => {
  //data from request
  const { email, userName, password } = req.body;
  //check user existence
  const user = await User.findOne({ email });
  if (user) return new Error(" user already existed!", { cause: 409 });

  //generate token
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  //create user
  await User.create({ ...req.body });
  //create confirmation link
  const confirmationLink = `http://localhost:3000/auth/activate_account/${token}`;

  //send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: signUpTemp(confirmationLink),
  });
  if (!messageSent) return next(new Error("something went wrong !"));
  //send response
  return res.json({ success: true, message: "check your email !" });
});

// activate account

export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = jwt.verify(token, process.env.TOKEN_SECRET);
  //find user and update isConfirmed
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });

  //check if the user doesn't exist
  if (!user) return next(new Error("user not found", { cause: 404 }));

  //create a cart
  await Cart.create({ user: user._id });

  //send response
  return res.json({ success: true, message: "try to login" });
});

//login
export const login = asyncHandler(async (req, res, next) => {
  //data from request
  const { email, password } = req.body;
  //check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email !", { cause: 404 }));
  //check isConfirmed
  if (!user.isConfirmed)
    return next(new Error("You Should activate your account !"));
  //check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("password is wrong !"));
  //generate token
  const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
  //save token in token model
  await Token.create({ token, user: user._id });
  //sand response
  return res.json({ success: true, results: { token } });
});

// send forget code
export const forgetCode = asyncHandler(async (req, res, next) => {
  //data from request
  const { email } = req.body;
  //check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email !", { cause: 404 }));

  // check isConfirmed
  if (!user.isConfirmed) return next(new Error("Activate your account first!"));

  //generate forget code
  const forgetCode = Randomstring.generate({
    charset: "numeric",
    length: 5,
  });
  //save forget code to user
  user.forgetCode = forgetCode;
  await user.save();

  //send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Reset password",
    html: resetPassTemp(forgetCode),
  });
  if (!messageSent) return next(new Error("Something Went Wrong "));
  //send response
  return res.json({ success: true, message: "Check Your Email" });
});

//reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  //data from request
  const { email, password, forgetCode } = req.body;
  //check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email !", { cause: 404 }));

  //check the forget Code
  if (forgetCode !== user.forgetCode)
    return next(new Error("Code is invalide !"));
  //hash password and save user
  user.password = bcryptjs.hashSync(password, parseInt(process.env.SALT_ROUND));
  await user.save();
  //find all token of the user
  const tokens = await Token.find({ user: user._id });

  //invalidate all token of the user
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  //send response
  return res.json({ success: true, message: "Try to login again" });
});
