import { prisma } from '../utils/prisma/index.js';

export class CommentsRepository {
  findCommentById = async (commentId) => {
    return await prisma.Comments.findUnique({
      where: { commentId: Number(commentId) },
    });
  };

  updateCommentById = async (commentId, content) => {
    return await prisma.Comments.update({
      where: { commentId: Number(commentId) },
      data: { content: content },
    });
  };

  getCommentsByPostId = async (postId) => {
    return await prisma.Comments.findMany({
      where: { PostId: Number(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: { nickname: true },
        },
      },
    });
  };

  createComments = async (postId, userId, content) => {
    return await prisma.Comments.create({
      data: {
        PostId: postId,
        UserId: userId,
        content: content,
      },
    });
  };

  checkPostExist = async (postId) => {
    return await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });
  };
  deleteCommentById = async (commentId) => {
    return await prisma.Comments.delete({
      where: { commentId: Number(commentId) },
    });
  };
}
