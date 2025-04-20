import express from 'express';
import { createPost, deletePost, getPost, like_dislike_Post, timeline, updatePost, getPostByUserId, deleteReply, addReply, deleteComment, getComments, addComment } from '../Controllers/PostController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

router.post('/', authMiddleWare, createPost);
router.get('/:id' ,authMiddleWare , getPost);
router.put('/:id',authMiddleWare, updatePost);
router.delete('/:id',authMiddleWare, deletePost);
router.put('/:id/like_dislike',authMiddleWare, like_dislike_Post);
router.get('/:id/timeline', authMiddleWare,timeline);
router.get('/user/:id', authMiddleWare, getPostByUserId);


// New comment routes
router.post('/:id/comment', authMiddleWare, addComment);
router.get('/:id/comments', authMiddleWare, getComments);
router.delete('/:postId/comment/:commentId', authMiddleWare, deleteComment);

// New reply routes
router.post('/:postId/comment/:commentId/reply', authMiddleWare, addReply);
router.delete('/:postId/comment/:commentId/reply/:replyId', authMiddleWare, deleteReply);

export default router;