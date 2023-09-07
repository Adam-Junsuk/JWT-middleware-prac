import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// 게시글 작성 API
router.post('/', verifyToken, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;
  if (!userId) {
    return res.status(403).json({ message: '로그인이 필요한 기능입니다' });
  }
  if (!title || !content) {
    return res
      .status(412)
      .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
  console.log('req.body:', req.body);
  console.log('req.user.userId:', req.user.userId);

  try {
    const post = await prisma.Posts.create({
      data: {
        title,
        content,
        UserId: userId,
      },
    });
    return res.status(201).json({ message: '게시글을 생성하였습니다.', post });
  } catch (error) {
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: '게시글 작성에 실패하셨습니다', error: error.message });
  }
});

// 게시글 목록 조회 API
router.get('/', async (req, res) => {
  try {
    // prisma를 이용하여 모든 게시글을 조회합니다.
    // 선택적으로 조회할 필드를 지정합니다.
    const posts = await prisma.Posts.findMany({
      select: {
        postId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        UserId: true,
        User: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 작성 날짜 기준 내림차순 정렬
      },
    });

    const formattedPosts = posts.map((post) => ({
      postId: post.postId,
      userId: post.UserId, // userId를 추가합니다.
      title: post.title,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      nickname: post.User ? post.User.nickname : 'Anonymous',
    }));

    return res.status(200).json({ data: formattedPosts });
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({ message: '서버 에러', error: error.message });
  }
});
// 게시글 상세 조회 API
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await prisma.Posts.findUnique({
      where: {
        postId: Number(postId),
      },
      select: {
        postId: true,
        UserId: true, // UserId를 불러옵니다.
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            nickname: true, // 닉네임을 불러옵니다.
          },
        },
      },
    });

    if (!post) {
      return res
        .status(400)
        .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }

    const formattedPost = {
      postId: post.postId,
      userId: post.UserId, // UserId를 추가합니다.
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      nickname: post.User ? post.User.nickname : 'Anonymous',
    };

    return res.status(200).json({ post: formattedPost });
  } catch (error) {
    console.error(error.stack);
    return res
      .status(400)
      .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 삭제 API
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    // 게시글 존재 유무 확인
    const existingPost = await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });

    if (!existingPost) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    // 게시글 소유자 확인
    if (existingPost.UserId !== req.user.userId) {
      return res
        .status(403)
        .json({ errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.' });
    }

    // 게시글 삭제
    await prisma.Posts.delete({
      where: { postId: Number(postId) },
    });

    res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  } catch (error) {
    console.error(error);
    // 예외 케이스
    res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
  }
});

/** 게시글 수정 API **/
router.put('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    console.log(postId);
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(412).json({ message: '데이터 형식이 좋지 못하구만' });
    }
    //게시글 조회
    const exisPost = await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });

    if (!exisPost) {
      return res.status(401).json({ message: '찾는 게시글이 없어요' });
    }

    if (exisPost.UserId !== req.user.userId) {
      console.log(req.user.userId);
      console.log(exisPost.UserId);
      return res.status(403).json({ message: '게시글 수정 권한이 없어요~' });
    }
    //이제 게시글을 수정해보자
    await prisma.Posts.update({
      where: { postId: Number(postId) },
      data: {
        title,
        content,
      },
    });

    res.status(200).json({ message: '게시글을 수정했습니다' });
  } catch (error) {
    console.error(error.stack);
    res.status(400).json({ message: '게시글 수정에 실패하였습니다' });
  }
});

export default router;
