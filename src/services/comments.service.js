import { CommentsRepository } from '../repositories/comments.repository.js';
const commentsRepository = new CommentsRepository();
export class CommentsService {
  //댓글 생성
  createComments = async (postId, userId, content) => {
    const postExist = await commentsRepository.checkPostExist(postId);

    if (!postExist) {
      throw new Error('게시글이 없어요');
    }

    return await commentsRepository.createComments(postId, userId, content);
  };
  getCommentsByPostId = async (postId) => {
    const postExist = await commentsRepository.checkPostExist(postId);

    if (!postExist) {
      throw new Error('게시글이 없어요');
    }

    const comments = await commentsRepository.getCommentsByPostId(postId);

    return comments.map((comment) => {
      return {
        commentId: comment.commentId,
        userId: comment.UserId,
        nickname: comment.User.nickname,
        comment: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });
  };
  updateComment = async (commentId, userId, content) => {
    const targetComment = await commentsRepository.findCommentById(commentId);
    if (!targetComment) {
      throw new Error('뿌우~');
    }

    if (targetComment.UserId !== userId) {
      throw new Error('댓글 수정 권한이 없는댑쇼?');
    }

    return await commentsRepository.updateCommentById(commentId, content);
  };
  deleteComment = async (postId, commentId, userId) => {
    const postExist = await commentsRepository.checkPostExist(postId);
    const targetComment = await commentsRepository.findCommentById(commentId);

    if (!postExist) {
      throw { statusCode: 404, message: '게시글이 없어' };
    }
    if (!targetComment) {
      throw { statusCode: 404, message: '댓글이 없어' };
    }
    if (targetComment.UserId !== userId) {
      console.log(targetComment.UserId);
      console.log(Number(userId));
      throw {
        statusCode: 403,
        message: '댓글의 삭제 권한이 존재하지 않습니다.',
      };
    }
    // 댓글 삭제
    await commentsRepository.deleteCommentById(commentId);

    return { message: '댓글을 삭제하였습니다.' };
  };
}
