// src/services/posts.service.js

import { PostsRepository } from '../repositories/posts.repository.js';

export class PostsService {
  postsRepository = new PostsRepository();

  findAllPosts = async () => {
    // 저장소(Repository)에게 데이터를 요청합니다.
    const posts = await this.postsRepository.findAllPosts();

    // 호출한 Post들을 가장 최신 게시글 부터 정렬합니다.
    posts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    // 비즈니스 로직을 수행한 후 사용자에게 보여줄 데이터를 가공합니다.
    return posts.map((post) => {
      return {
        postId: post.postId,
        nickname: post.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });
  };

  createPost = async (postData, userId) => {
    if (!postData.title || !postData.content || !userId){
        throw new Error('Invalid data format')
    }
    const post = await this.postsRepository.createPost(postData, userId)
    return {status:201, data: {message:'게시글이 생성되었습니다' , post}}
  }
  getPostById = async (postId) => {
    const post = await this.postsRepository.getPostsById(Number(postId));
    if(!post){
        throw new Error('게시글을 찾을 수 없습니다')
    }
    return post;
  }
  deletePost = async(postId, userId)=>{
    const existingPost = await this.postsRepository.getPostById(Number(postId))

    if(!existingPost){
        throw new Error('게시글이 존재하지 않습니다');
    }
    if(existingPost.UserId !== userId){
        throw new Error('게시글의 삭제 권한이 존재하지 않습니다.')
    }

    await this.postsRepository.deletePost(Number(postId))
  }
  updatePost = async(postId, userId, title, content) => {
    if(!title || !content){
        throw new Error('데이터 형식이 좋지 못하구만')
    }

    const existingPost = await this.postsRepository.getPostId(Number(postId))

    if (!existingPost) {
        throw new Error('찾는 게시글이 없어요~')
    }

    if (existingPost) {
        throw new Error('게시글 수정 권한이 없어요~')
    }

    await this.postsRepository.updatePost(Number(postId))
  }
}
