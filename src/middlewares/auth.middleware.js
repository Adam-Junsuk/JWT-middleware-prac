// src/middlewares/auth.middleware.js


import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export default async function (req, res, next) {
    console.log(req.cookies)
  try {
    // 💡 **[게시판 프로젝트] 사용자 인증 미들웨어 비즈니스 로직**
    if (!req.cookies) {
      throw new Error('쿠키가 없습니다');
    }
    // 1. 클라이언트로 부터 **쿠키(Cookie)**를 전달받습니다.
    const { authorization } = req.cookies;
    // 2. **쿠키(Cookie)**가 **Bearer 토큰** 형식인지 확인합니다.
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw new Error('토큰 타입 불일치');

    // 3. 서버에서 발급한 **JWT가 맞는지 검증**합니다.
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    // 4. JWT의 `userId`를 이용해 사용자를 조회합니다.
    const user = await prisma.users.findFirst({
      where: { userId: Number(userId) },
    });
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }
    // 5. `req.user` 에 조회된 사용자 정보를 할당합니다.
    req.user = user;
    // 6. 다음 미들웨어를 실행합니다.
    next();
  } catch (error) {
    res.clearCookie('authorization');
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다' });
        break;
      case 'JsonWebTokenError': //토큰 검증 실패했을때
        return res.status(401).json({ message: '토큰 검증에 실패하였습니다.' });
        break;
      default:
        return res
          .status(401)
          .json({ message: error.message ?? '비 정상적인 요청입니다' });
    }
  }
}

