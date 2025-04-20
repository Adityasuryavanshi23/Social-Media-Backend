import postModel from '../Models/postModel.js';
import mongoose from 'mongoose';
import UserModel from "../Models/userModel.js";


// Create new post
export const createPost = async (req, res) => {
    try {
        const newPost = await postModel.create(req.body);      
        res.status(200).json(newPost)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
}

// get all post by user id 
export const getPostByUserId = async (req, res) => {
    const userId = req.params.id
    try {
        const post = await postModel.find({ userId: userId })
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

// get a post
export const getPost = async (req, res) => {
    const id = req.params.id
    try {
        const post = await postModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//Update a Post
export const updatePost = async (req, res) => {
    const postId = req.params.id

    const { userId } = req.body

    try {
        const post = await postModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}



// delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Like/Dislike a Post

export const like_dislike_Post = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// Get timeline a Posts
export const timeline = async (req, res) => {
    const userId = req.params.id;

    try {
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // Get current user's posts with user details
        const currentUserPosts = await postModel.aggregate([
            {
                $match: { userId: userObjectId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    desc: 1,
                    likes: 1,
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: 1,
                    comments: 1,
                    user: {
                        _id: "$userDetails._id",
                        username: "$userDetails.username",
                        firstname: "$userDetails.firstname",
                        lastname: "$userDetails.lastname",
                        profilePicture: "$userDetails.profilePicture"
                    }
                }
            }
        ]);
        // Get the current user's following list
        const user = await UserModel.findById(userId);
        let followingIds = [];
        
        // Convert string IDs to ObjectIds and handle the case where following might be empty
        if (user && user.following && user.following.length > 0) {
            followingIds = user.following.map(id => {
                // Handle if id is already an ObjectId or a string
                return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
            });
        }
        // Get posts from followed users - only if there are any followed users
        const followingPosts = followingIds.length > 0 ? 
            await postModel.aggregate([
                {
                    $match: { userId: { $in: followingIds } }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $project: {
                        _id: 1,
                        desc: 1,
                        likes: 1,
                        image: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        comments: 1,
                        userId: 1,
                        user: {
                            _id: "$userDetails._id",
                            username: "$userDetails.username",
                            firstname: "$userDetails.firstname",
                            lastname: "$userDetails.lastname",
                            profilePicture: "$userDetails.profilePicture"
                        }
                    }
                }
            ]) : [];
     
        // Get trending posts with user details
        const trendingPosts = await postModel.aggregate([
            {
                $match: {
                    $and: [
                        { userId: { $ne: userObjectId } },
                        { userId: { $nin: followingIds } },
                        { likes: { $exists: true } },
                        { $expr: { $gte: [{ $size: "$likes" }, 10] } }
                    ]
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" }
                }
            },
            {
                $sort: { likesCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    desc: 1,
                    likes: 1,
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    likesCount: 1,
                    userId: 1,
                    comments: 1,
                    user: {
                        _id: "$userDetails._id",
                        username: "$userDetails.username",
                        firstname: "$userDetails.firstname",
                        lastname: "$userDetails.lastname",
                        profilePicture: "$userDetails.profilePicture"
                    }
                }
            }
        ]);
        
        // Combine all posts
        const allPosts = [
            ...currentUserPosts,
            ...followingPosts,
            ...trendingPosts
        ];
        
        // Sort by creation date (newest first)
        const sortedPosts = allPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
        
        res.status(200).json(sortedPosts);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Add comment to a post
export const addComment = async (req, res) => {
    const postId = req.params.id;
    const { userId, text } = req.body;

    try {
        // Find the post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Get user details for the comment
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create new comment
        const newComment = {
            userId,
            text,
            username: user.username || user.firstname,
            userImage: user.profilePicture,
            replies: []
        };

        // Add comment to post
        post.comments.push(newComment);
        await post.save();

        res.status(200).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Get all comments for a post
export const getComments = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post.comments);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { userId } = req.body;

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Find the comment
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user is authorized to delete the comment
        if (comment.userId.toString() !== userId && post.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        // Remove the comment
        comment.remove();
        await post.save();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Add reply to a comment
export const addReply = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { userId, text } = req.body;

    try {
        // Find the post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Find the comment
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Get user details for the reply
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create new reply
        const newReply = {
            userId,
            text,
            username: user.username,
            userImage: user.profilePicture
        };

        // Add reply to comment
        comment.replies.push(newReply);
        await post.save();

        res.status(200).json({ message: "Reply added successfully", reply: newReply });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Delete a reply
export const deleteReply = async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { userId } = req.body;

    try {
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Find the comment
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Find the reply
        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        // Check if user is authorized to delete the reply
        if (reply.userId.toString() !== userId && post.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own replies" });
        }

        // Remove the reply
        reply.remove();
        await post.save();

        res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
