import { PostsService } from '../services/posts.service.js';

// Post의 컨트롤러(Controller)역할을 하는 클래스
export class PostsController {
  postsService = new PostsService(); // Post 서비스를 클래스를 컨트롤러 클래스의 멤버 변수로 할당합니다.

  getPosts = async (req, res, next) => {
    try {
      // 서비스 계층에 구현된 findAllPosts 로직을 실행합니다.
      const posts = await this.postsService.findAllPosts();

      return res.status(200).json({ data: posts });
    } catch (err) {
      next(err);
    }
  };
  createPost = async (req, res, next) => {
    try{
        const result = await this.postsService.createPost(req.body, req.user.userId);
        return res.status(result.status).json(result.data);
    } catch (err) {
        next(err)
    }
  }
  getPostById = async (req, res, next) => {
    try{
        const {postId} = req.params;
        const post = await this.postsService.getPostById(postId)
        return res.status(200).json({post})
    } catch(err) {
        next(err)
    }
  }
  deletePost = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const userId = req.user.userId;
        await this.postsService.deletePost(postId, userId)
        return res.status(200).json({message:'게시글을 삭제했습니다'})
    } catch(err){
        next(err)
    }
  }
  updatePost = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const {title, content} = req.body;
        const userId = req.user.userId

        await this.postsService.updatePost(postId, userId, title, content)
        return res.status(200).json({message:'게시글을 업뎃 완료'})
     }catch(err) {
        next(err)
      }
  }
  
}
