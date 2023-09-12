import { CommentsService } from '../services/comments.service.js';

// Post의 컨트롤러(Controller)역할을 하는 클래스
export class CommentsController {
  commentsService = new CommentsService(); // Post 서비스를 클래스를 컨트롤러 클래스의 멤버 변수로 할당합니다.

  getCommentsByPostId = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const formattedComments = await this.commentsService.getCommentsByPostId(
        Number(postId)
      );

      res.status(200).json({ comments: formattedComments });
    } catch (err) {
      next(err);
    }
  };

  createComment = async (req, res, next) => {
    try {
      const postId = Number(req.params.postId);
      const userId = req.user.userId;
      const { content } = req.body;

      if (!content) {
        return res.status(412).json({ message: '댓글 내용을 입력해주세요.' });
      }
      await this.commentsService.createComments(postId, userId, content);

      res.status(201).json({ message: '댓글을 작성하였습니다' });
    } catch (err) {
      next(err);
    }
  };

  updateComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      console.log(commentId);
      const { userId } = req.user.userId;

      await this.commentsService.updateComment(commentId, userId, content);

      res.status(200).json({ message: '댓글 수정 완료!' });
    } catch (err) {
      next(err);
    }
  };
  deleteComment = async (req, res, next) => {
    const userId = req.user.userId;
    const { postId, commentId } = req.params;

    try {
      const result = await this.commentsService.deleteComment(
        postId,
        commentId,
        userId
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
