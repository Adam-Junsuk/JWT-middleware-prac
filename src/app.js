//src/app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import UserRouter from './routes/users.router.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import indexRouter from './utils/prisma/index.js';
import PostsRouter from './routes/post.router.js';
import LikesRouter from './routes/likes.router.js';
import CommentsRouter from './routes/comments.router.js';
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import dotenv from 'dotenv';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swaggerOptions.js';

dotenv.config();
// ES6 방식으로 __filename과 __dirname을 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3017;
const router = express.Router();

//Swagger 문서 설정
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 정적 파일을 제공하기 위한 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use(LogMiddleware);
app.use(express.json());
// JSON을 파싱하기 위한 미들웨어 설정
app.use(cookieParser());
app.get('/posts/:postId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/posts.html'));
});

//User.router.js를 생성하고, 이 라우터를 바탕으로 실제 전역 미들웨어에 등록했다.

app.use('/api', [UserRouter, indexRouter, LikesRouter]);
router.use('/posts', [PostsRouter, CommentsRouter]);

// router 인스턴스를 /api 하위 경로로 등록
app.use('/api', router);
app.use(ErrorHandlingMiddleware);
// 서버 시작
app.listen(PORT, () => {
  console.log(`${PORT} 포트로 서버가 열렸어요!`);
});
