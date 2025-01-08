import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;

  const filters = {};
  if (query) {
    filters.title = { $regex: query, $options: "i" }; // Case-insensitive search in title
  }
  if (userId && isValidObjectId(userId)) {
    filters.user = userId;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

  const [videos, total] = await Promise.all([
    Video.find(filters).sort(sortOptions).skip(skip).limit(pageSize),
    Video.countDocuments(filters),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Videos fetched successfully", {
      total,
      page: pageNumber,
      limit: pageSize,
      videos,
    })
  );
});

export const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "tile and description is required ");
  }
  if (!req.file) {
    throw new ApiError(400, "No video file uploaded");
  }

  const localFileVideo = req.file?.videoFile.path;
  const localFileThumbnail = req.file?.thumbnail.path;

  if (!(localFileVideo && localFileThumbnail)) {
    throw new ApiError(500, "video upload fail");
  }

  const video = uploadOnCloudinary(localFileVideo);
  const thumbnail = uploadOnCloudinary(localFileThumbnail);
  if (!video && !thumbnail) {
    throw new ApiError(500, "video upload fail ");
  }

  const newVideo = await Video.create({
    title,
    description,
    video: video.url,
    thumbnail: thumbnail.url,
    user: req.user.id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Video published successfully", newVideo));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("user", "name email"); // Assuming you want user details
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Video retrieved successfully", video));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  let thumbnailLocalPath;
  if (
    req.file &&
    Array.isArray(req.file.thumbnail) &&
    req.file.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.file.thumbnail.path;
  }

  const thumbnail = uploadOnCloudinary(thumbnailLocalPath);

  const videoUpdated = await Video.findByIdAndUpdate(videoId, {
    $set: {
      thumbnail,
      description,
      title,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, videoUpdated, "video Updated Successfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError();
  }

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError();
  }
  if (video.cloudinaryPublicId) {
    await uploadOnCloudinary.destroy(video.cloudinaryPublicId);
  }
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save();
  res
    .status(200)
    .json(new ApiResponse("Video publish status updated successfully", video));
});
