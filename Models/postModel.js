import mongoose from "mongoose";

const replySchema = mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users',
            required: true 
        },
        text: { 
            type: String, 
            required: true 
        },
        username: String,
        userImage: String
    },
    {
        timestamps: true
    }
);

const commentSchema = mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users',
            required: true 
        },
        text: { 
            type: String, 
            required: true 
        },
        username: String,
        userImage: String,
        replies: [replySchema]
    },
    {
        timestamps: true
    }
);

const postSchema = mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users',
            required: true 
        },
        desc: String,
        likes: [],
        image: String,
        comments: [commentSchema]
    },
    {
        timestamps: true,
    }
);

const postModel = mongoose.model("Posts", postSchema);

export default postModel;
