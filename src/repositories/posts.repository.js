// src/repositories/posts.repository.js

import { prisma } from '../utils/prisma/index.js';

export class PostsRepository {
  findAllPosts = async () => {
    // ORM인 Prisma에서 Posts 모델의 findMany 메서드를 사용해 데이터를 요청합니다.
    const posts = await prisma.posts.findMany();

    return posts;
  };

  createPost = async (postData, userId) => {
    const post = await prisma.Posts.create({
      data: {
        title: postData.title,
        content: postData.content,
        UserId: userId,
      },
    });
    return post;
  };
  getPostsById = async (postId) => {
    const post = await prisma.Posts.findUnique({
      where: {
        postId: postId,
      },
      select: {
        postId: true,
        UserId: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            nickname: true,
          },
        },
      },
    });
    return post;
  };

  deletePost = async (postId) => {
    await prisma.Posts.delete({
      where: { postId: postId },
    });
  };

  updatePost = async (commentId, content) => {
    return await prisma.comments.update({
      where: { commentId: Number(commentId) },
      data: { content: content },
    });
  };
}
