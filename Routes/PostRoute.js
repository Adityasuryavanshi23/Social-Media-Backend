import express from 'express';
import { createPost, deletePost, getPost, like_dislike_Post, timeline, updatePost } from '../Controllers/PostController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

router.post('/', authMiddleWare(), createPost);
router.get('/:id' ,authMiddleWare() , getPost);
router.put('/:id',authMiddleWare(), updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like_dislike', like_dislike_Post);
router.get('/:id/timeline', timeline);

export default router;