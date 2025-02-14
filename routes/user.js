const express = require("express");
const UserController = require("../controller/CUser");

const router = express.Router();

// 회원 가입 페이지
router.get("/join", UserController.getJoin);

// 로그인 페이지
router.get("/login", UserController.getLogin);

// 회원 정보 수정 페이지
router.get("/changeInfo", UserController.getChange);

// 마이페이지 메인
router.get("/myPage", UserController.getMyPage);

// 회원가입
router.post("/join", UserController.join);

// 아이디 중복 검사
router.post("/checkId", UserController.checkId);

// 로그인
router.post("/login", UserController.login);

// 로그아웃
router.post("/logout", UserController.logout);

// 비밀번호 재설정
router.post("/makeNewPw", UserController.makeNewPw);

// 회원 탈퇴
router.patch("/deleteUser", UserController.deleteUser);

// 회원 정보 수정
router.patch("/changeInfo", UserController.changeInfo);

// 닉네임 중복 검사
router.post("/checkNickname", UserController.checkNickname);

module.exports = router;
