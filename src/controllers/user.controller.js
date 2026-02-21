import { User } from "../models/user.model.js";
import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import generateToken from "../utils/generateToken.js";
import {apiResponce} from "../utils/apiResponce.js"

export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password, bio } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name, Email & Password are required.");
  }

  const alreadyExistUser = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (alreadyExistUser) {
    throw new ApiError(400, "User with name or email alreaady exist.");
  }

  // check for avater and cover Image

  const avaterLocalPath = req.files?.avater[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // upload them to cloudinary, avater
  avater = await uplodeOnCloudinary(avaterLocalPath);
  coverImage = await uplodeOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    bio,
    avater: avater?.url || "",
    coverImage: avater?.url || "",
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Error is creating user.");
  }

  generateToken(res, user._id, "Account created successfully.");
});

export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // find user using Email address (Email is an unique Identity)

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(String(password)))) {
    throw new ApiError(401, "Invalid email or pasword");
  }

  generateToken(res, user._id, `Welcome back ${user.name}`);
});

export const signOutUser = catchAsync(async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({
    success: true,
    message: "Signout Successfully",
  });
});

export const changeCurrentUserPassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(res.user._id);
  const isCorrectPassword = await user.isCorrectPassword(oldPassword);

  if (!isCorrectPassword) {
    throw new ApiError(401, "Invalid pasword");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponce(200, {}, "Password changed successfully"));
});

export const getCurrentUserDetails = catchAsync(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fatched successfully");
});

export const updateAccountDetails = catchAsync(async (req, res) => {});

export const updateUserAvater = catchAsync(async (req, res) => {
  const avaterLocalPath = req.files?.path;

  if (!avaterLocalPath) {
    throw new ApiError(400, "Avater file is missing");
  }

  const avater = await uplodeOnCloudinary(avaterLocalPath);

  if (!avater.url) {
    throw new ApiError(400, "Error while uploading avater ");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avater: avater.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponce(200, user, "avater update changed successfully"));
});

export const updateUserCoverImage = catchAsync(async (req, res) => {
  const coverImageLocalPath = req.files?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uplodeOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover Image ");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponce(200, user, "Cover Image update changed successfully"));
});
