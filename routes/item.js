const express = require("express");
const controller = require("../controller/Citem"); // 컨트롤러 임포트
const router = express.Router();
const authenticateToken = require("../middlewares/jwtAuth");

// GET /api-server/item - 전체 상품 조회
router.post("/items", authenticateToken, controller.getAllItems);

// POST /api-server/item/pickRegion - 지역 설정
router.post("/pickRegion", authenticateToken, controller.setRegion);

// POST /api-server/item/pickCategory - 카테고리 설정
router.post("/pickCategory", authenticateToken, controller.setCategory);

// GET /api-server/item?keyword=검색어 - 상품 검색
router.get("/items", authenticateToken, controller.searchItems);

// POST /api-server/item/addItem - 판매 글 등록
router.post("/addItem", authenticateToken, controller.createItem);

// POST /api-server/item/editItem - 판매 글 수정
router.post("/editItem", authenticateToken, controller.updateItem);

// DELETE /api-server/item/deleteItem - 판매 글 삭제
router.delete("/deleteItem", authenticateToken, controller.deleteItem);

// POST /api-server/item/dynamicUpload - 사진 업로드
router.post("/dynamicUpload", authenticateToken, controller.uploadImage);

// POST /api-server/item/save - 찜하기
router.post("/save", authenticateToken, controller.addToFavorites);

module.exports = router;
