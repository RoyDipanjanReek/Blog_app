import { isValidObjectId } from "mongoose";
import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { apiResponce } from "../utils/apiResponce.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";

export const addComment = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!postId || !isValidObjectId(postId)) {
    throw new ApiError(400, "invalid postId");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content,
    postId: postId,
    owner: req.User._id,
  });

  return res
    .status(201)
    .json(new apiResponce(201, comment, "Comment created successfully"));
});

export const updateComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const { _id: userId } = req.User;

  const comment = Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (!comment?.trim()) {
    throw new ApiError(404, "Comment can not be empty. ");
  }
  if (comment.owner?.toString() !== userId.toString()) {
    throw new ApiError(404, "You are not the owner of this comment to update.");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    {
      new: true,
    },
  );

  if (!updateComment) {
    throw new ApiError(404, "Error while updating comment");
  }

  return res
    .status(201)
    .json(new apiResponce(200, updateComment, "Comment updated successfully"));
});

export const deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { _id: userId } = req.User;

  if (!commentId || isValidObjectId(commentId)) {
    throw new ApiError(500, "Invalid comment ID");
  }

  const comment = Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(500, "Comment not found");
  }

  if (comment.owner?.toString() !== userId?.toString()) {
    throw new ApiError(400, "You are not the owner of this comment to delete");
  }

  const deleteComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new apiError(500, "Error while deleting comment");
  }

  return res
    .status(200)
    .json(new apiResponce(200, null, "Comment updated successfully"));
});
