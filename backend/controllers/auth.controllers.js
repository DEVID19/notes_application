const isProduction = process.env.NODE_ENV === "production";
import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email");
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 4,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      throw new Error(
        "Password is not strong enough (4 chars, uppercase, lowercase, number, symbol required).",
      );
    }

    const exsistingUserName = await User.findOne({ name });
    if (exsistingUserName) {
      throw new Error("Name is already exist");
    }
    const exsistingUser = await User.findOne({ email });
    if (exsistingUser) {
      throw new Error("Email already exist");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: passwordHash,
    });

    const token = await generateToken(user._id);
    //* for devlopment
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   sameSite: "strict",
    //   secure: false,
    // });
    //* for production
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "None" : "Strict",
      secure: isProduction,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      userId: user._id,
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    }

    const token = await generateToken(user._id);
    //* for dev
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   sameSite: "strict",
    //   secure: false,
    // });
    //* for production
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "None" : "Strict",
      secure: isProduction,
    });

    res.status(200).json({
      success: true,
      message: "login successfully",
      userId: user._id,
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    //* for dev
    // res.clearCookie("token", {
    //   sameSite: "strict",
    //   secure: false,
    // });
    //* for production

    res.clearCookie("token", {
      sameSite: isProduction ? "None" : "Strict",
      secure: isProduction,
    });

    return res.status(200).json({
      success: true,
      message: "logout successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
