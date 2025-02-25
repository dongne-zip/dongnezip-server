const { where } = require("sequelize");
const {
  User,
  sequelize,
  Item,
  Favorite,
  Transaction,
  ItemImage,
} = require("../model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const SALT = 10;
const SECRET_KEY = process.env.SECRET_KEY;

// 인증 번호 이메일 전송 함수
const sendVerificationCode = async (email) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ email, code }, process.env.SECRET_KEY, {
      expiresIn: "3m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "dongnezio 이메일 인증번호",
      html: `
        <p>안녕하세요! dongnezip을 방문해 주셔서 감사합니다!</p>
        <p>회원가입을 완료하려면 아래 인증번호를 입력해 주세요.</p>
        <p>인증번호: <strong>${code}</strong></p>
      `,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    return token; // 생성한 토큰 반환
  } catch (error) {
    console.error("이메일 인증 코드 전송 실패:", error);
  }
};

/* api */

// 로그인 유지
exports.token = async (req, res, next) => {
  const getUser = req.user || null;
  if (!getUser) {
    return res.json({ message: "사용자를 찾을 수 없습니다." });
  }
  try {
    const user = await User.findOne({ where: { id: getUser.id } });
    if (!user) {
      return res.status(400).json({ message: "사용자를 찾을 수 없습니다." });
    }
    return res.json({ result: true, nickname: user.nickname, id: user.id });
  } catch (error) {
    console.error("user 정보 찾을 수 없음:", error);
    return res.status(500).json({
      message: "user 정보를 찾을 수 없습니다!",
    });
  }
};

/* 이메일 인증 */
// 인증 번호 이메일 전송
exports.sendCode = async (req, res, next) => {
  const { email } = req.body;

  try {
    const token = await sendVerificationCode(email); // 공통 함수 호출

    return res.json({
      result: true,
      message: "이메일로 인증번호를 발송했습니다. 인증번호를 입력해주세요.",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "이메일 전송 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    });
  }
};

exports.verifyCode = (req, res, next) => {
  const { code, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // 인증번호 비교
    if (decoded.code === code) {
      return res.json({ result: true, message: "인증 성공!" });
    } else {
      return res.json({
        message: "인증번호가 일치하지 않습니다. 다시 시도해주세요.",
      });
    }
  } catch (error) {
    console.error("인증번호 검증 실패:", error);
    return res.json({ message: "JWT 검증 실패 또는 만료된 토큰입니다." });
  }
};

// 비밀번호 찾기
exports.findPw = async (req, res, next) => {
  const { code, token, newPw } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.code !== code) {
      return res.status(400).json({
        message: "인증번호가 일치하지 않습니다. 다시 시도해주세요.",
      });
    }

    const user = await User.findOne({ email: decoded.email });
    if (user) {
      user.password = bcrypt.hashSync(newPw, 10);
      await user.save();

      return res.json({
        result: true,
        message: "비밀번호가 성공적으로 변경되었습니다.",
      });
    } else {
      return res
        .status(404)
        .json({ message: "해당 이메일을 가진 사용자가 없습니다." });
    }
  } catch (error) {
    console.error("비밀번호 변경 처리 중 오류 발생:", error);
    return res.status(500).json({
      message:
        "비밀번호 변경 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    });
  }
};

// 회원가입 (로컬)
exports.join = async (req, res, next) => {
  const { email, name, nickname, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.json({ message: "이미 가입된 이메일입니다." });
    }

    const isNick = await User.findOne({ where: { nickname } });
    if (isNick) {
      return res.json({ message: "이미 존재하는 닉네임입니다." });
    }

    const salt = await bcrypt.genSalt(SALT);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      name,
      nickname,
      password: hash,
    });

    return res.json({ result: true, message: "회원가입 성공" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 아이디 중복 검사
exports.checkId = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.json({ message: "이미 존재하는 아이디입니다." });
    }

    return res.json({ result: true, message: "사용 가능한 아이디입니다." });
  } catch (error) {
    console.error(error);
    return res.json({ message: "서버 오류가 발생했습니다." });
  }
};

// 로컬 로그인
exports.localLogin = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.email) {
      return res.json({ message: "가입되지 않은 이메일입니다." });
    }

    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
      return res.json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 발급

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "7d",
    });

    // 쿠키 옵션 설정
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // 쿠키에 JWT 저장
    res.cookie("authToken", token, cookieOptions);

    return res.json({ result: true, message: "로그인 성공", token, user });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 카카오 로그인
exports.kakaoLogin = async (req, res, next) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(401).json({ message: "로그인 실패: 사용자 정보 없음" });
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("authToken", token, cookieOptions);

    return res.json({
      result: true,
      message: "로그인 성공",
      token,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 구글 로그인
exports.googleLogin = async (req, res) => {
  const user = req.user;

  try {
    // JWT 발급

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "7d",
    });

    // 쿠키 옵션 설정
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // 쿠키에 JWT 저장
    res.cookie("authToken", token, cookieOptions);

    return res.json({ result: true, message: "로그인 성공", token });
  } catch (error) {
    console.error(error);
    return res.json({ message: "구글 로그인 중 오류가 발생했습니다." });
  }
};

// 로그아웃
exports.logout = (req, res, next) => {
  try {
    // 로컬 로그인: 쿠키에서 JWT 토큰 삭제
    res.cookie("authToken", "", {
      httpOnly: true,
      secure: false,
      maxAge: 0, // 만료 시간 0으로 설정
    });

    return res.status(200).json({
      result: true,
      message: "로그아웃되었습니다.",
    });

    // 카카오/구글 로그인: passport 세션 종료
    req.logout((err) => {
      if (err) return next(err);
      return res.json({ result: true, message: "로그아웃 성공" });
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 회원 정보 수정
exports.changeInfo = async (req, res, next) => {
  const { nickname, oldPw, newPw } = req.body;

  try {
    const getUser = req.user || null;

    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });
    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호를 수정하려는 경우, 비밀번호 확인 과정 추가
    if (newPw) {
      const isMatch = await bcrypt.compare(oldPw, user.password);
      if (!isMatch) {
        return res.json({ message: "현재 비밀번호가 일치하지 않습니다." });
      }

      const salt = await bcrypt.genSalt(SALT);
      const hash = await bcrypt.hash(newPw, salt);
      user.password = hash; // 비밀번호 수정
    }

    // 닉네임을 수정하려는 경우, 닉네임 수정
    if (nickname) {
      user.nickname = nickname;
    }

    // 이미지 수정
    if (req.file) {
      const imageUrl = req.file.location;
      user.profileImg = imageUrl;
    }

    await user.save();
    return res.json({
      result: true,
      message: "회원 정보 수정 성공",
      user,
      profileImg: user.profileImg,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const getUser = req.user || null;
    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });

    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 사용자 삭제
    await user.destroy();
    return res.json({ result: true, message: "회원 탈퇴 성공" });
  } catch (err) {
    console.error(err);
    return res.json({ message: "서버 오류가 발생했습니다." });
  }
};

// 닉네임 중복 검사
exports.checkNick = async (req, res) => {
  const { nickname } = req.body;

  try {
    const user = await User.findOne({ where: { nickname } });

    if (user) {
      return res.json({ message: "이미 존재하는 닉네임입니다." });
    }

    return res.json({ result: true, message: "사용 가능한 닉네임입니다." });
  } catch (error) {
    console.error(error);
    return res.json({ message: "서버 오류가 발생했습니다." });
  }
};

/* 마이페이지 */
// 마이페이지 메인
exports.mypage = async (req, res) => {
  try {
    const getUser = req.user || null;
    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });

    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 판매 물품 조회
    const soldItems = await Transaction.findAll({
      where: { sellerId: getUser },
      include: [
        {
          model: Item,
          where: { userId: getUser },
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              attributes: ["id", "imageUrl"],
            },
          ],
        },
      ],
    });

    // 구매 물품 조회
    const boughtItems = await Transaction.findAll({
      where: { buyerId: getUser },
      include: [
        {
          model: Item,
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              attributes: ["id", "imageUrl"],
            },
          ],
        },
      ],
    });

    // 찜한 물품 조회
    const favoriteItems = await Favorite.findAll({
      where: { userId: getUser },
      include: [
        {
          model: Item,
          attributes: ["id", "title", "price", "status", "itemStatus"],
          include: [
            {
              model: ItemImage,
              attributes: ["id", "imageUrl"],
            },
          ],
        },
      ],
    });
    return res.status(200).json({
      result: true,
      message: "마이페이지 정보 조회 성공",
      soldItems,
      boughtItems,
      favoriteItems,
    });
  } catch (err) {
    console.error(err);
    return res.json({ message: "서버 오류가 발생했습니다." });
  }
};

// 판매 내역
exports.soldItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const getUser = req.user || null;
    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });

    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where: {
        sellerId: getUser,
      },
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              as: "images",
              required: false,
              attributes: ["imageUrl"],
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);

    return res.json({
      items: rows.map((item) => {
        return {
          id: item.item.id,
          title: item.item.title,
          price: item.item.price,
          images: item.item.images.map((image) => image.imageUrl),
        };
      }),
      currentPage: page,
      totalPages: totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 구매 내역
exports.boughtItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const getUser = req.user || null;
    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });

    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where: {
        buyerId: getUser,
      },
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              as: "images",
              required: false,
              attributes: ["imageUrl"],
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);

    return res.json({
      items: rows.map((item) => {
        return {
          id: item.item.id,
          title: item.item.title,
          price: item.item.price,
          images: item.item.images.map((image) => image.imageUrl),
        };
      }),
      currentPage: page,
      totalPages: totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 찜 내역
exports.LikeItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const getUser = req.user || null;
    if (!getUser) {
      return res.status(400).json({ message: "로그인 정보가 없습니다." });
    }

    const user = await User.findOne({ where: { id: getUser.id } });

    if (!user) {
      return res.json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { rows, count } = await Favorite.findAndCountAll({
      where: {
        userId: getUser,
      },
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              as: "images",
              required: false,
              attributes: ["imageUrl"],
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);
    return res.json({
      items: rows.map((favorite) => {
        return {
          id: favorite.item.id,
          title: favorite.item.title,
          price: favorite.item.price,
          images: favorite.item.images.map((image) => image.imageUrl),
        };
      }),
      currentPage: page,
      totalPages: totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
