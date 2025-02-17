const express = require("express");
const passport = require("passport");
const UserController = require("../controller/Cuser");
const authenticateToken = require("../middlewares/jwtAuth");

const router = express.Router();

// 회원가입
router.post("/join", UserController.join);

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

// 비밀번호 재설정
router.patch("/changePw", authenticateToken, UserController.changePw);

// 회원 탈퇴
router.delete("/deleteUser", authenticateToken, UserController.deleteUser);

// 회원 정보 수정
router.patch("/changeInfo", authenticateToken, UserController.changeInfo);

// 닉네임 중복 검사
router.get("/checkNickname", authenticateToken, UserController.checkNickname);

module.exports = router;
