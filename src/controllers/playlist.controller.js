import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name || name.trim === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  const newPlaylist = await Playlist.create({
    name,
    description: description || "",
    userId,
    createdAt: new Date(),
  });
  res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", newPlaylist));
});

export const getPlaylistByUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!isValidObjectId(userID)) {
    throw new ApiError(400, "invalid user ID");
  }
  const playlist = await Playlist.find({
    userID,
  }).sort({ createdAt: -1 });
  if (!playlist || playlist.length === 0) {
    throw new ApiError(404, "No playlists found for this user");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "User playlists retrieved successfully", playlist)
    );
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.videos.include(videoId)) {
    throw new ApiError(400, "Video already exists in the playlist");
  }

  playlist.videos.push(videoId);
  await Playlist.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});
export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!playlist.videos.include(videoId)) {
    throw new ApiError(400, "Video not exists in the playlist");
  } else {
    playlist.videos.pop(videoId);
    await Playlist.save();
    res
      .status(200)
      .json(new ApiResponse(200, "Video is deleted from playlist ", playlist));
  }
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findOne(playlistId);
  if (!playlist) {
    throw new ApiError(403, "playlist has been not found ");
  }
  await Playlist.deleteOne({ _id: playlistId });

  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});
export const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!name || name.trim === "") {
    throw new ApiError(400, "Playlist name is required ");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description: description || "",
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "playlist has been updated ", playlist));
});
