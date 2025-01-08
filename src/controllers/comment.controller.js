import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Step 1: Extract videoId
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  const comments = await Comment.find({ videoId })
    .sort({ createdAt: -1 }) // Sort by most recent comments
    .skip(skip)
    .limit(parseInt(limit));

  const totalComments = await Comment.countDocuments({ videoId }); // Total number of comments for the video

  res.status(200).json(
    new ApiResponse("Comments fetched successfully", {
      comments,
      totalComments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalComments / limit),
    })
  );
});

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = new Comment({
    videoId,
    userId,
    content,
    createdAt: new Date(),
  });

  await comment.save();
  res.status(201).json(new ApiResponse("Comment added successfully", comment));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  res.status(200).json(new ApiResponse("Comment deleted successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "commentId is invalid ");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is required ");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse("Comment updated successfully", updatedComment));
});
