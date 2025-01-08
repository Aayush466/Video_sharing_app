import mongoose, { isValidObjectId } from "mongoose";
// import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the request body

    if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid channel or user ID");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
    });

    if (existingSubscription) {
        
        await existingSubscription.deleteOne();
        res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
    } else {
        
        await Subscription.create({ channel: channelId, subscriber: userId });
        res.status(200).json(new ApiResponse(200, "Subscribed successfully"));
    }
});

export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name email") // Assuming User model has name and email fields
        .select("-channel");

    res.status(200).json(new ApiResponse(200, "Subscriber list fetched successfully", subscribers));
});

export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name description") // Assuming Channel model has name and description fields
        .select("-subscriber");

    res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", channels));
});


