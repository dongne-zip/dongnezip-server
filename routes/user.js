const express = require("express");
const passport = require("passport");
const UserController = require("../controller/Cuser");
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");
const router = express.Router();

<<<<<<< HEAD
// 인증 번호 이메일 전송
router.post("/sendCode", UserController.sendCode);

// 인증번호 검증
router.post("/verifyCode", UserController.verifyCode);

// 회원가입 (로컬)
=======
// 회원가입
>>>>>>> parent of 06be73c (feat/add user api)
router.post("/join", UserController.join);

// 비밀번호 찾기
router.post("/findPw", UserController.findPw);

// 아이디 중복 검사
router.get("/checkId", UserController.checkId);

// 카카오 로그인
router.get("/kakao", passport.authenticate("kakao"));
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/?error=카카오로그인 실패",
  }),
  UserController.kakaoLogin
);

// 구글 로그인
router.post("/login/google", UserController.googleLogin);

// 로컬 로그인
router.post("/login/local", UserController.localLogin);

// 로그아웃
router.post("/logout", authenticateToken, UserController.logout);

// 프로필 이미지 수정
router.post(
  "/changeImg",
  upload.single("profileImg"),
  UserController.changeImg
);

// 회원 정보 수정
router.patch("/changeInfo", authenticateToken, UserController.changeInfo);

// 회원 탈퇴
router.delete("/deleteUser", authenticateToken, UserController.deleteUser);

// 닉네임 중복 검사
router.get("/checkNickname", authenticateToken, UserController.checkNickname);

/* 마이페이지 */

// 마이페이지 메인
router.get("/mypage", authenticateToken, UserController.mypage);

// 판매 내역
router.get("soldItems", authenticateToken, UserController.soldItems);

// 구매 내역
router.get("boughtItems", authenticateToken, UserController.boughtItems);

// 찜 내역
router.get("LikeItems", authenticateToken, UserController.LikeItems);

module.exports = router;
