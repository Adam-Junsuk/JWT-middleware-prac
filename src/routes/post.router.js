/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: All about posts
 */
import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';


//PostsController의 인스턴스를 생성합니다.
import { PostsController } from '../controllers/posts.controller.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// PostsController의 인스턴스를 생성합니다.
const postsController = new PostsController();
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: 게시글 작성 API
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *       412:
 *         description: 데이터 형식 오류
 *       403:
 *         description: 로그인 필요
 *       500:
 *         description: 서버 에러
 */
// 게시글 작성 API

router.post('/', verifyToken, postsController.createPost);

// 게시글 목록 조회 API
router.get('/', postsController.getPosts);

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: 게시글 상세 조회 API
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 조회 실패
 */
// 게시글 상세 조회 API
router.get('/:postId');
/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: 게시글 삭제 API
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       403:
 *         description: 삭제 권한 없음
 *       404:
 *         description: 게시글 없음
 *       400:
 *         description: 삭제 실패
 */
// 게시글 삭제 API
router.delete('/:postId', verifyToken, postsController.deletePost);
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: 게시글 수정 API
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       400:
 *         description: 수정 실패
 *       403:
 *         description: 수정 권한 없음
 *       412:
 *         description: 데이터 형식 오류
 */
/** 게시글 수정 API **/
router.put('/:postId', verifyToken, postsController.updatePost);

export default router;
