// src/routes/users.routher.js

import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//라우터 생성
const router = express.Router();

//회원가입 API
router.post('/sign-up', async (req, res, next) => {
  try {
    //1. email, password, name, age, gender, profileImage를 바디로 부터 전달 받습니다.
    const {
      email,
      password,
      nickname,
      name,
      age,
      gender,
      profileImage,
      rePass,
    } = req.body;
    //1.1 닉네임 형식 검사 (최소 3자, 알파벳 대소문자와 숫자로만 구성)
    const nicknameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!nicknameRegex.test(nickname)) {
      return res
        .status(400)
        .json({ message: '닉네임 형식이 올바르지 않아요~' });
    }
    //1.2 비밀번호 최소 4자 이상, 닉네임과 같은 값 포함된 경우 회원가입 실패
    if (password.length < 4 || password.includes(nickname)) {
      return res
        .status(400)
        .json({ message: '비밀번호 형식이 올바르지 않습니다~' });
    }

    if (password !== rePass) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    //2. 동일한 email을 가진 사용자가 있는지 확인합니다.
    //그래서 Index.js에서 가져온 prisma 객체에서 Users에서 findFirst 메소드를 사용해서 조회할꺼야.
    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일 입니다.' });
    }

    //3. Users 테이블에 email, password를 이용해 사용자를 생성합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, userInfo] = await prisma.$transaction(
      async (tx) => {
        //트랜잭션 내부에서 사용자를 생성합니다.
        const user = await tx.users.create({
          data: {
            email,
            nickname,
            password: hashedPassword,
          },
        });
        // 트랜잭션 내부에서 사용자 정보를 생성한다.
        const userInfo = await tx.UserInfos.create({
          data: {
            UserId: user.userId,
            name,
            age,
            gender: gender.toUpperCase(),
            profileImage,
          },
        });
        // 콜백 함수의 리턴 값으로 사용자와 사용자 정보를 반환한다.
        return [user, userInfo];
      },
      {
        isolationLevel: prisma.$transactionIsolationLevel.ReadCommitted,
      }
    );
    return res.status(201).json({ message: '회원가입이 완료되었습니다' });
  } catch (err) {
    next(err);
  }
});

// 사용자 로그인 API
router.post('/sign-in', async (req, res) => {
  try {
    // 클라이언트로부터 닉네임과 비밀번호를 전달받습니다.
    const { nickname, password } = req.body;

    // 데이터베이스에서 해당 닉네임을 가진 사용자를 찾습니다.
    const user = await prisma.Users.findFirst({ where: { nickname } });

    // 해당하는 유저가 존재하지 않는 경우
    if (!user) {
      return res
        .status(412)
        .json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    }

    // 비밀번호가 일치하지 않는 경우
    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(412)
        .json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    }

    // JWT 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      JWT_SECRET_KEY // 비밀키
    );

    // 로그인에 성공한 경우, 토큰을 반환합니다.
    return res.status(200).json({ token });
  } catch (error) {
    // 예외 케이스에서 처리하지 못한 에러
    return res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
  }
});

//사용자 조회 API

// 💡 **[게시판 프로젝트] 사용자 정보 조회 API 비즈니스 로직**

// 1. 클라이언트가 **로그인된 사용자인지 검증**합니다.
// 2. 사용자를 조회할 때, 1:1 관계를 맺고 있는 **Users**와 **UserInfos** 테이블을 조회합니다.
// 3. 조회한 사용자의 상세한 정보를 클라이언트에게 반환합니다.
router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId: Number(userId) },
      select: {
        userId: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        UserInfos: {
          select: {
            name: true,
            age: true,
            gender: true,
            profileImage: true,
          },
        },
      },
    });
    // 사용자 정보가 없다면 404 코드로 응답
    if (!user) {
      return res.status(404).json({ message: '사용자 정보가 없습니다.' });
    }

    res.status(200).json({ data: user });
    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: '서버에러' });
  }
});

/** 사용자 정보 변경 API **/
router.patch('/users/', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updatedData = req.body;

    const userInfo = await prisma.userInfos.findFirst({
      where: { UserId: +userId },
    });

    await prisma.$transaction(
      async (tx) => {
        // 트랜잭션 내부에서 사용자 정보를 수정합니다.
        await tx.userInfos.update({
          data: {
            ...updatedData,
          },
          where: {
            UserId: userInfo.UserId,
          },
        });

        // 변경된 필드만 UseHistories 테이블에 저장합니다.
        for (let key in updatedData) {
          if (userInfo[key] !== updatedData[key]) {
            await tx.userHistories.create({
              data: {
                UserId: userInfo.UserId,
                changedField: key,
                oldValue: String(userInfo[key]),
                newValue: String(updatedData[key]),
              },
            });
          }
        }
      },
      {
        isolationLevel: prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res
      .status(200)
      .json({ message: '사용자 정보 변경에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});

//라우터를 외부로 전달
export default router;
