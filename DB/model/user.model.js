import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowerCase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    forgetCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dijc0vzim/image/upload/v1767823279/prifile_picture_nmojrm.jpg",
      },
      id: { type: String, default: "prifile_picture_nmojrm" },
    },
    coverImages: [{ url: { type: String }, id: { type: String } }],
  },
  { timestamps: true },
);

userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND),
    );
  }
});

export const User = model("User", userSchema);
