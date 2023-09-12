//comments.routner.js
import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
//PostsController의 인스턴스를 생성합니다.
import { CommentsController } from '../controllers/comments.controller.js';
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

const commentsController = new CommentsController();
/** 댓글 작성 API **/
router.post('/:postId/comments', verifyToken, commentsController.createComment);

//댓글목록 조회
router.get('/:postId/comments', commentsController.getCommentsByPostId);

//댓글 수정
router.put(
  '/:postId/comments/:commentId',
  verifyToken,
  commentsController.updateComment
);
// 댓글 삭제

router.delete('/:postId/comments/:commentId', verifyToken, commentsController.deleteComment);

export default router;
