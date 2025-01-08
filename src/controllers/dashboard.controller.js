import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const totalVideos = await Video.countDocuments({ channel: channelId });

  const totalViews = await Video.aggregate([
    { $match: { channel: mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const totalLikes = await Like.countDocuments({
    channel: channelId,
    status: "like",
  });

  res.status(200).json(
    new ApiResponse(200, "Channel stats fetched successfully", {
      totalVideos,
      totalViews: totalViews.length ? totalViews[0].totalViews : 0,
      totalSubscribers,
      totalLikes,
    })
  );
});

export const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ channel: channelId }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Channel videos fetched successfully", videos));
});
