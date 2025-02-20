const express = require("express");
const passport = require("passport");
const UserController = require("../controller/Cuser");
const authenticateToken = require("../middlewares/jwtAuth");

const router = express.Router();

// 인증 번호 이메일 전송
router.post("/sendCode", UserController.sendCode);

// 인증번호 검증
router.post("/verifyCode", UserController.verifyCode);

// 회원가입
router.post("/join", UserController.join);

// 아이디 중복 검사
router.post("/checkId", UserController.checkId);

// 로컬 로그인
router.post("/login/local", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "로그인 실패" });
    }

    req.user = user;
    UserController.localLogin(req, res, next);
  })(req, res, next);
});

// 로그아웃
router.post("/logout", authenticateToken, UserController.logout);

// 비밀번호 재설정
router.patch("/changePw", authenticateToken, UserController.changePw);

// 회원 탈퇴
router.delete("/deleteUser", authenticateToken, UserController.deleteUser);

// 회원 정보 수정
router.patch("/changeInfo", authenticateToken, UserController.changeInfo);

// 닉네임 중복 검사
router.post("/checkNick", authenticateToken, UserController.checkNick);

module.exports = router;
