import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { apiResponce } from "../utils/apiResponce.js";
import { Post } from "../models/post.model.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

export const createPost = catchAsync(async (req, res) => {
  const { content } = req.body;
  const imageFileLocalPath = req.files?.image?.[0]?.path;

  /* 
  if only content -> post only content
  if content + image -> post both (content + image)
  if only image -> post only image 
  if nothing is there return error . you have to give wither content or image
  */

  if (!content && !imageFileLocalPath) {
    throw new ApiError(400, "You have to provide either content or image.");
  }

  let imageUrl = "";

  if (!imageFileLocalPath?.url) {
    const uploadImage = await uplodeOnCloudinary(imageFileLocalPath);

    if (!uploadImage?.url) {
      throw new ApiError(400, "Error while uploading image");
    }

    imageUrl = uploadImage.url;
  }

  const post = await Post.create({
    content: content || "",
    image: imageUrl || "",
    owner: req?.user?._id,
  });

  return res
    .status(201)
    .json(new apiResponce(201, post, "Post created successfully"));
});

export const getUserPosts = catchAsync(async (req, res) => {
  const { userId } = req.params;
  isValidObjectId(userId, User);

  const result = await Post.find({ owner: userId });

  return res
    .status(200)
    .json(new apiResponce(200, result, "successflly fetched user Tweet"));
});

export const updatePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "No post found.");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update course");
  }

  let imageUrl = post.image;

  if (req.file) {
    if (post.image) {
      await deleteFromCloudinary(post.image);
    }

    // Upload new image
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    imageUrl = uploadedImage?.secure_url;
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      content,
      image: imageUrl,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(201)
    .json(new apiResponce(200, updatedPost, "Post updated successfully"));
});

export const deletePost = catchAsync(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(401, "No post found.");
  }

  if (post.owner.toString() !== req._id.toString()) {
    throw new ApiError(403, "Not authorized to delete post.");
  }

  if (post.image) {
    await deleleFromCloudinary(post.image);
  }

  await Post.findByIdAndDelete(postId);
  return res
    .status(201)
    .json(new apiResponce(201, null, "Post delete successfully"));
});
