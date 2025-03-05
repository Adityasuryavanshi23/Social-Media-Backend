import express from 'express';
import { createPost, deletePost, getPost, like_dislike_Post, timeline, updatePost, getPostByUserId } from '../Controllers/PostController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

router.post('/', authMiddleWare, createPost);
router.get('/:id' ,authMiddleWare , getPost);
router.put('/:id',authMiddleWare, updatePost);
router.delete('/:id', authMiddleWare, deletePost);
router.put('/:id/like_dislike', authMiddleWare, like_dislike_Post);
router.get('/timeline/:id', authMiddleWare, timeline);
router.get('/user/:id', authMiddleWare, getPostByUserId);


export default router;