import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

 export const videoLikeToggle = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video ID")
    }
    const existedLike = await Like.findOne({
        userId,
        entityId: videoId,
        entityType: "video",
    })
    if(existedLike){
        //toggle off
        await Like.deleteOne({
            _id:existedLike._id
        })
        res.status(200).json(new ApiResponse(200, "video like removed", { toggled: false }));
    }else 
    {
        // toggle on 
        await Like.Create({
            userId,
        entityId: videoId,
        entityType: "video",
        })
        res.status(200).json(new ApiResponse(200, "Comment liked", { toggled: true }));
    }
})

export  const commentLikeToggle = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(commentIdId)){
        throw new ApiError(400,"invalid Comment ID")
    }
    const existedLike = await Like.findOne({
        userId,
        entityId: videoId,
        entityType: "video",
    })
    if(existedLike){
        //toggle off
        await Like.deleteOne({
            _id:existedLike._id
        })
        res.status(200).json(new ApiResponse(200, "video like removed", { toggled: false }));
    }else 
    {
        // toggle on 
        await Like.Create({
            userId,
        entityId: videoId,
        entityType: "video",
        })
        res.status(200).json(new ApiResponse(200, "Comment liked", { toggled: true }));
    }
})

export  const tweetLikeToggle = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(tweetIdId)){
        throw new ApiError(400,"invalid tweet ID")
    }
    const existedLike = await Like.findOne({
        userId,
        entityId: tweetId,
        entityType: "tweet",
    })
    if(existedLike){
        //toggle off
        await Like.deleteOne({
            _id:existedLike._id
        })
        res.status(200).json(new ApiResponse(200, "video like removed", { toggled: false }));
    }else 
    {
        // toggle on 
        await Like.Create({
            userId,
        entityId: tweetId,
        entityType: "tweet",
        })
        res.status(200).json(new ApiResponse(200, "Comment liked", { toggled: true }));
    }
})

export const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const likes = await Like.find({
        user:userId
    }).populate("video")

    if(!likes ||  likes.length === 0 ){
        return res.status(200) 
    }

    const likedVideos = likes.map((like)=> like.video)
     return res.status(200).json(new ApiResponse(200,"Liked videos retrieved succesfully "))
})
 



